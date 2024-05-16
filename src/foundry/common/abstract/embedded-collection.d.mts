import type { DocumentConstructor } from "../../../types/helperTypes.d.mts";
import type { InexactPartial } from "../../../types/utils.d.mts";
import type _Collection from "../utils/collection.d.mts";

type Collection<T> = Omit<_Collection<T>, "set" | "delete">;

interface CollectionConstructor {
  new (): Collection<any>;
  new <T>(entries?: readonly (readonly [string, T])[] | null): Collection<T>;
  new <T>(iterable: Iterable<readonly [string, T]>): Collection<T>;
  readonly [Symbol.species]: CollectionConstructor;
  readonly prototype: Collection<any>;
}

declare const Collection: CollectionConstructor;

/**
 * An extension of the Collection.
 * Used for the specific task of containing embedded Document instances within a parent Document.
 */
declare class EmbeddedCollection<
  ContainedDocumentConstructor extends DocumentConstructor,
  ParentDataModel extends foundry.abstract.Document<any, any, any>,
> extends Collection<InstanceType<ContainedDocumentConstructor>> {
  /**
   * @param name          - The name of this collection in the parent Document.
   * @param parent        - The parent DataModel instance to which this collection belongs
   * @param sourceArray   - The source data array for the collection in the parent Document data
   */
  constructor(
    name: string,
    parent: ParentDataModel,
    sourceArray: ConstructorParameters<ContainedDocumentConstructor>[0][],
  );

  /**
   * The Document implementation used to construct instances within this collection
   */
  readonly documentClass: ContainedDocumentConstructor;

  /**
   * The name of this collection in the parent Document.
   */
  readonly name: string;

  /**
   * The parent DataModel to which this EmbeddedCollection instance belongs.
   */
  readonly model: ParentDataModel;

  /**
   * Has this embedded collection been initialized as a one-time workflow?
   * @defaultValue `false`
   */
  protected _initialized: boolean;

  /**
   * The source data array from which the embedded collection is created
   */
  protected readonly _source: ConstructorParameters<ContainedDocumentConstructor>[0][];

  /**
   * Record the set of document ids where the Document was not initialized because of invalid source data
   */
  invalidDocumentIds: Set<string>;

  /**
   * Instantiate a Document for inclusion in the Collection
   */
  createDocument(
    data: ConstructorParameters<ContainedDocumentConstructor>[0],
    context: DocumentConstructionContext,
  ): InstanceType<ContainedDocumentConstructor>;

  /**
   * Initialize the EmbeddedCollection object by constructing its contained Document instances
   * @param options - Initialization options
   */
  protected initialize(
    options: InexactPartial<{
      /**
       * Whether to log an error or a warning when encountering invalid embedded documents.
       */
      strict: boolean;
    }>,
  ): void;

  /**
   * Initialize an embedded document and store it in the collection.
   * @param data    - The Document data.
   * @param options - Options to configure Document initialization.
   */
  protected _initializeDocument(
    data: ConstructorParameters<ContainedDocumentConstructor>[0],
    options: InexactPartial<{
      /**
       * Whether to log an error or warning if the Document fails to initialize.
       */
      strict: boolean;
    }>,
  ): void;

  /**
   * Log warnings or errors when a Document is found to be invalid.
   * @param id      - The invalid Document's ID.
   * @param err     - The validation error
   * @param options - Options to configure invalid Document handling.
   */
  _handleInvalidDocument(
    id: string,
    err: Error,
    options: InexactPartial<{
      /**
       * Whether to throw an error or only log a warning.
       */
      strict: boolean;
    }>,
  ): void;

  /**
   * Get an element from the EmbeddedCollection by its ID.
   * @param id      - The ID of the Embedded Document to retrieve.
   * @param options - Additional options to configure retrieval.
   */
  get(
    key: string,
    options?: InexactPartial<{
      /**
       * Throw an Error if the requested Embedded Document does not exist.
       * @defaultValue `false`
       */
      strict: false;
      /**
       * Allow retrieving an invalid Embedded Document.
       * @defaultValue `false`
       */
      invalid: false;
    }>,
  ): InstanceType<ContainedDocumentConstructor> | undefined;
  /**
   * Get an element from the EmbeddedCollection by its ID.
   * @param id      - The ID of the Embedded Document to retrieve.
   * @param options - Additional options to configure retrieval.
   */
  get(id: string, options: { strict: true; invalid?: false }): InstanceType<ContainedDocumentConstructor>;
  /**
   * Get an element from the EmbeddedCollection by its ID.
   * @param id      - The ID of the Embedded Document to retrieve.
   * @param options - Additional options to configure retrieval.
   */
  get(id: string, options: { strict?: boolean; invalid: true }): unknown;

  /**
   * Add an item to the collection
   * @param key     - The embedded Document ID
   * @param value   - The embedded Document instance
   * @param options - Additional options to the set operation
   */
  set(
    key: string,
    value: InstanceType<ContainedDocumentConstructor>,
    options?: InexactPartial<{
      /**
       * Whether to modify the collection's source as part of the operation.
       * @defaultValue `true`
       */
      modifySource: boolean;
    }>,
  ): this;

  /**
   * Modify the underlying source array to include the Document.
   * @param key   - The Document ID Key
   * @param value - The Document
   */
  protected _set(key: string, value: InstanceType<ContainedDocumentConstructor>): void;

  /**
   * @param key     - The embedded Document ID.
   * @param options - Additional options to the delete operation.
   */
  delete(
    key: string,
    options?: {
      /**
       * Whether to modify the collection's source as part of the operation.
       */
      modifySource?: boolean;
    },
  ): boolean;

  /**
   * Remove the value from the underlying source array.
   * @param key     - The Document ID key.
   * @param options - Additional options to configure deletion behavior.
   */
  protected _delete(key: string, options: Record<string, unknown>): void;

  /**
   * Update an EmbeddedCollection using an array of provided document data.
   * @param changes - An array of provided Document data
   * @param options - Additional options which modify how the collection is updated
   */
  update(changes: ConstructorParameters<ContainedDocumentConstructor>[0][], options?: Record<string, unknown>): void;

  protected _createOrUpdate(
    data: ConstructorParameters<ContainedDocumentConstructor>[0][],
    options?: Parameters<InstanceType<ContainedDocumentConstructor>["updateSource"]>[1],
  ): void;

  // TODO: Improve typing on invalid documents
  /**
   * Obtain a temporary Document instance for a document id which currently has invalid source data.
   * @param id      - A document ID with invalid source data.
   * @param options - Additional options to configure retrieval.
   * @returns An in-memory instance for the invalid Document
   * @throws If strict is true and the requested ID is not in the set of invalid IDs for this collection.
   */
  getInvalid(
    id: string,
    options?: {
      /**
       * Throw an Error if the requested ID is not in the set of invalid IDs for this collection
       */
      strict?: false;
    },
  ): unknown;
  getInvalid(
    id: string,
    options: {
      /**
       * Throw an Error if the requested ID is not in the set of invalid IDs for this collection
       */
      strict: true;
    },
  ): unknown;

  /**
   * Convert the EmbeddedCollection to an array of simple objects.
   * @param source - Draw data for contained Documents from the underlying data source?
   *                 (default: `true`)
   * @returns The extracted array of primitive objects
   */
  toObject(source?: true): InstanceType<ContainedDocumentConstructor>["_source"][];
  toObject(source: false): ReturnType<InstanceType<ContainedDocumentConstructor>["schema"]["toObject"]>[];
}

export default EmbeddedCollection;
