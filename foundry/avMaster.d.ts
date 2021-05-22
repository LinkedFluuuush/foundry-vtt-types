/**
 * The master Audio/Video controller instance.
 * This is available as the singleton game.webrtc
 */
declare class AVMaster {
  constructor();

  settings: AVSettings;

  config: AVConfig;

  /**
   * The Audio/Video client class
   */
  client: AVClient;

  /**
   * A flag to track whether the current user is actively broadcasting their microphone.
   * @defaultValue `false`
   */
  broadcasting: boolean;

  /**
   * Flag to determine if we are connected to the signalling server or not.
   * This is required for synchronization between connection and reconnection attempts.
   * @defaultValue `false`
   */
  protected _connected: boolean;

  /**
   * A flag to track whether the A/V system is currently in the process of reconnecting.
   * This occurs if the connection is lost or interrupted.
   * @defaultValue `false`
   */
  protected _reconnecting: boolean;

  /**
   * @defaultValue `{}`
   */
  protected _speakingData: AVMaster.SpeakingData;

  /**
   * @defaultValue `{}`
   */
  protected _pttHandlers: AVMaster.PTTHandlers;

  /**
   * @defaultValue `0`
   */
  protected _pttMuteTimeout: number;

  get mode(): AVSettings.VoiceMode;

  /**
   * Connect to the Audio/Video client.
   * @returns Was the connection attempt successful?
   */
  connect(): Promise<boolean>;

  /**
   * Disconnect from the Audio/Video client.
   * @returns Whether an existing connection was terminated?
   */
  disconnect(): Promise<boolean>;

  /**
   * Callback actions to take when the user becomes disconnected from the server.
   */
  reestablish(): Promise<void>;

  /**
   * Initialize the local broadcast state.
   */
  protected _initialize(): void;

  /**
   * A user can broadcast audio if the AV mode is compatible and if they are allowed to broadcast.
   */
  canUserBroadcastAudio(userId: string): boolean;

  /**
   * A user can share audio if they are allowed to broadcast and if they have not muted themselves or been blocked.
   */
  canUserShareAudio(userId: string): boolean;

  /**
   * A user can broadcast video if the AV mode is compatible and if they are allowed to broadcast.
   */
  canUserBroadcastVideo(userId: string): boolean;

  /**
   * A user can share video if they are allowed to broadcast and if they have not hidden themselves or been blocked.
   */
  canUserShareVideo(userId: string): boolean;

  /**
   * Trigger a change in the audio broadcasting state when using a push-to-talk workflow.
   * @param intent - The user's intent to broadcast. Whether an actual broadcast occurs will depend
   *                 on whether or not the user has muted their audio feed.
   */
  broadcast(intent: boolean): void;

  /**
   * Set up audio level listeners to handle voice activation detection workflow.
   * @param mode - The currently selected voice broadcasting mode
   */
  protected _initializeUserVoiceDetection(mode: AVSettings.VoiceMode): void;

  /**
   * Activate voice detection tracking for a userId on a provided MediaStream.
   * Currently only a MediaStream is supported because MediaStreamTrack processing is not yet supported cross-browser.
   * @param userId - The Foundry User ID whose voice is being processed
   * @param stream - The MediaStream which corresponds to that User
   * @param ms     - A number of milliseconds which represents the voice activation volume interval
   *                 (default: `CONFIG.WebRTC.detectPeerVolumeInterval`)
   */
  activateVoiceDetection(userId: string, stream: MediaStream, ms?: number): void;

  /**
   * Actions which the orchestration layer should take when a peer user disconnects from the audio/video service.
   * @param userId - The id of the disconnecting User
   */
  deactivateVoiceDetection(userId: string): void;

  /**
   * Periodic notification of user audio level
   *
   * This function uses the audio level (in dB) of each stream it's listening to to determine if a user
   * is speaking or not and notifies the UI of such changes.
   *
   * The User is considered speaking if they are above the decibel threshold in any of the history values.
   * This marks them as speaking as soon as they have a high enough volume, and marks them as not speaking only after
   * they drop below the threshold in all histories (last 4 volumes = for 200 ms).
   *
   * There can be more optimal ways to do this and which uses whether the user was already considered speaking before
   * or not, in order to eliminate short bursts of audio (coughing for example).
   *
   * @param userId  - The user ID of the user whose audio levels are being reported
   * @param dbLevel - The audio level in decibels of the user within the last 50ms
   */
  protected _onAudioLevel(userId: string, dbLevel: number): void;

  /**
   * Set up interactivity and handling of push-to-talk broadcasting workflow.
   */
  _initializePushToTalk(): void;

  /**
   * Resets the speaking history of a user
   * If the user was considered speaking, then mark them as not speaking
   * @param userId - The ID of the user
   */
  _resetSpeakingHistory(userId: string): void;

  /**
   * Handle activation of a push-to-talk key or button.
   * @param event - The original keydown event
   */
  _onPTTStart(event: KeyboardEvent | MouseEvent): void;

  /**
   * Handle deactivation of a push-to-talk key or button.
   * @param event - The original keyup event
   */
  _onPTTEnd(event: KeyboardEvent | MouseEvent): void;

  render(): void;

  /**
   * Render the audio/video streams to the CameraViews UI.
   * Assign each connected user to the correct video frame element.
   */
  onRender(): void;

  /**
   * Respond to changes which occur to AV Settings.
   * Changes are handled in descending order of impact.
   * @param changed - The object of changed AV settings
   */
  onSettingsChanged(changed: DeepPartial<AVSettings.Settings>): void;

  debug(message: string): void;
}

declare namespace AVMaster {
  type SpeakingData = Partial<Record<string, { speaking: boolean; volumeHistories: number[] }>>;
  type PTTHandler = (event: KeyboardEvent | MouseEvent) => void;
  type PTTHandlers =
    | {}
    | { mousedown: PTTHandler; mouseup: PTTHandler }
    | {
        keydown: PTTHandler;
        keyup: PTTHandler;
      };
}
