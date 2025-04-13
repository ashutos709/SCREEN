'use strict';

// SCREEN - Configuration File
const dotenv = require('dotenv').config();
const packageJson = require('../../package.json');
const os = require('os');
const fs = require('fs');
const splitChar = ',';

// Environment and System Configuration
const PLATFORM = os.platform();
const IS_DOCKER = fs.existsSync('/.dockerenv');
const ENVIRONMENT = process.env.NODE_ENV || 'development';
const PUBLIC_IP = process.env.SFU_PUBLIC_IP || '';
const LISTEN_IP = process.env.SFU_LISTEN_IP || '0.0.0.0';
const IPv4 = getIPv4();

// WebRTC Port Configuration
const RTC_MIN_PORT = parseInt(process.env.SFU_MIN_PORT) || 40000;
const RTC_MAX_PORT = parseInt(process.env.SFU_MAX_PORT) || 40100;
const NUM_CPUS = os.cpus().length;
const NUM_WORKERS = Math.min(process.env.SFU_NUM_WORKERS || NUM_CPUS, NUM_CPUS);

// FFmpeg Path Configuration
const RTMP_FFMPEG_PATH = process.env.RTMP_FFMPEG_PATH || getFFmpegPath(PLATFORM);

// Main Configuration Export
module.exports = {
    // 1. Core System Configuration
    system: {
        info: {
            os: {
                type: os.type(),
                release: os.release(),
                arch: os.arch(),
            },
            cpu: {
                cores: NUM_CPUS,
                model: os.cpus()[0].model,
            },
            memory: {
                total: (os.totalmem() / 1024 / 1024 / 1024).toFixed(2) + ' GB',
            },
            isDocker: IS_DOCKER,
        },
        console: {
            timeZone: 'UTC',
            debug: ENVIRONMENT !== 'production',
            colors: true,
        },
        services: {
            ip: ['http://api.ipify.org', 'http://ipinfo.io/ip', 'http://ifconfig.me/ip'],
        },
    },

    // 2. Server Configuration
    server: {
        hostUrl: process.env.SERVER_HOST_URL || 'https://localhost:3010',
        listen: {
            ip: process.env.SERVER_LISTEN_IP || '0.0.0.0',
            port: process.env.SERVER_LISTEN_PORT || 3010,
        },
        trustProxy: process.env.TRUST_PROXY === 'true',
        ssl: {
            cert: process.env.SERVER_SSL_CERT || '../ssl/cert.pem',
            key: process.env.SERVER_SSL_KEY || '../ssl/key.pem',
        },
        cors: {
            origin: process.env.CORS_ORIGIN || '*',
            methods: ['GET', 'POST'],
        },
    },

    // 3. Media Handling Configuration
    media: {
        recording: {
            enabled: process.env.RECORDING_ENABLED === 'true',
            endpoint: process.env.RECORDING_ENDPOINT || '',
            dir: 'rec',
            maxFileSize: 1 * 1024 * 1024 * 1024, // 1GB
        },
        rtmp: {
            enabled: process.env.RTMP_ENABLED === 'true',
            fromFile: process.env.RTMP_FROM_FILE !== 'false',
            fromUrl: process.env.RTMP_FROM_URL !== 'false',
            fromStream: process.env.RTMP_FROM_STREAM !== 'false',
            maxStreams: parseInt(process.env.RTMP_MAX_STREAMS) || 1,
            useNodeMediaServer: process.env.RTMP_USE_NODE_MEDIA_SERVER !== 'false',
            server: process.env.RTMP_SERVER || 'rtmp://localhost:1935',
            appName: process.env.RTMP_APP_NAME || 'live',
            streamKey: process.env.RTMP_STREAM_KEY || '',
            secret: process.env.RTMP_SECRET || 'SCREENRtmpSecret',
            apiSecret: process.env.RTMP_API_SECRET || 'SCREENRtmpApiSecret',
            expirationHours: parseInt(process.env.RTMP_EXPIRATION_HOURS) || 4,
            dir: 'rtmp',
            ffmpegPath: RTMP_FFMPEG_PATH,
            platform: PLATFORM,
        },
    },

    // 4. Security & Authentication
    security: {
        middleware: {
            IpWhitelist: {
                enabled: process.env.IP_WHITELIST_ENABLED === 'true',
                allowedIPs: process.env.IP_WHITELIST_ALLOWED
                    ? process.env.IP_WHITELIST_ALLOWED.split(splitChar)
                          .map((ip) => ip.trim())
                          .filter((ip) => ip !== '')
                    : ['127.0.0.1', '::1'],
            },
        },
        jwt: {
            key: process.env.JWT_SECRET || 'SCREEN_jwt_secret',
            exp: process.env.JWT_EXPIRATION || '1h',
        },
        oidc: {
            enabled: process.env.OIDC_ENABLED === 'true',
            baseURLDynamic: false,
            peer_name: {
                force: true,
                email: true,
                name: false,
            },
            config: {
                issuerBaseURL: process.env.OIDC_ISSUER || 'https://server.example.com',
                baseURL: process.env.OIDC_BASE_URL || `http://localhost:${process.env.PORT || 3010}`,
                clientID: process.env.OIDC_CLIENT_ID || 'clientID',
                clientSecret: process.env.OIDC_CLIENT_SECRET || 'clientSecret',
                secret: process.env.OIDC_SECRET || 'SCREEN-oidc-secret',
                authRequired: false,
                auth0Logout: true,
                authorizationParams: {
                    response_type: 'code',
                    scope: 'openid profile email',
                },
                routes: {
                    callback: '/auth/callback',
                    login: false,
                    logout: '/logout',
                },
            },
        },
        host: {
            protected: process.env.HOST_PROTECTED === 'true',
            user_auth: process.env.HOST_USER_AUTH === 'true',
            users_from_db: process.env.HOST_USERS_FROM_DB === 'true',
            users_api_secret_key: process.env.USERS_API_SECRET || 'SCREENweb_default_secret',
            users_api_endpoint:
                process.env.USERS_API_ENDPOINT || 'http://localhost:9000/api/v1/user/isAuth',
            users_api_room_allowed:
                process.env.USERS_ROOM_ALLOWED_ENDPOINT || 'http://localhost:9000/api/v1/user/isRoomAllowed',
            users_api_rooms_allowed:
                process.env.USERS_ROOMS_ALLOWED_ENDPOINT || 'http://localhost:9000/api/v1/user/roomsAllowed',
            api_room_exists: process.env.ROOM_EXISTS_ENDPOINT || 'http://localhost:9000/api/v1/room/exists',
            users: [
                {
                    username: process.env.DEFAULT_USERNAME || 'username',
                    password: process.env.DEFAULT_PASSWORD || 'password',
                    displayname: process.env.DEFAULT_DISPLAY_NAME || 'username display name',
                    allowed_rooms: process.env.DEFAULT_ALLOWED_ROOMS
                        ? process.env.DEFAULT_ALLOWED_ROOMS.split(splitChar)
                              .map((room) => room.trim())
                              .filter((room) => room !== '')
                        : ['*'],
                },
            ],
            presenters: {
                list: process.env.PRESENTERS
                    ? process.env.PRESENTERS.split(splitChar)
                          .map((presenter) => presenter.trim())
                          .filter((presenter) => presenter !== '')
                    : ['Miroslav Pejic', 'miroslav.pejic.85@gmail.com'],
                join_first: process.env.PRESENTER_JOIN_FIRST !== 'false',
            },
        },
    },

    // 5. API Configuration
    api: {
        keySecret: process.env.API_SECRET || 'SCREEN_default_secret',
        allowed: {
            stats: process.env.API_ALLOW_STATS !== 'false',
            meetings: false,
            meeting: true,
            join: true,
            token: false,
            slack: true,
            mattermost: true,
        },
    },

    // 6. Third-Party Integrations
    integrations: {
        chatGPT: {
            enabled: process.env.CHATGPT_ENABLED === 'true',
            basePath: process.env.CHATGPT_BASE_PATH || 'https://api.openai.com/v1/',
            apiKey: process.env.CHATGPT_API_KEY || '',
            model: process.env.CHATGPT_MODEL || 'gpt-3.5-turbo',
            max_tokens: parseInt(process.env.CHATGPT_MAX_TOKENS) || 1000,
            temperature: parseInt(process.env.CHATGPT_TEMPERATURE) || 0,
        },
        videoAI: {
            enabled: process.env.VIDEOAI_ENABLED !== 'false',
            basePath: 'https://api.heygen.com',
            apiKey: process.env.VIDEOAI_API_KEY || '',
            systemLimit: process.env.VIDEOAI_SYSTEM_LIMIT || 'You are a streaming avatar from SCREEN...',
        },
        email: {
            alert: process.env.EMAIL_ALERTS_ENABLED === 'true',
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.EMAIL_PORT) || 587,
            username: process.env.EMAIL_USERNAME || 'your_username',
            password: process.env.EMAIL_PASSWORD || 'your_password',
            sendTo: process.env.EMAIL_SEND_TO || 'SCREEN@gmail.com',
        },
        slack: {
            enabled: process.env.SLACK_ENABLED === 'true',
            signingSecret: process.env.SLACK_SIGNING_SECRET || '',
        },
        mattermost: {
            enabled: process.env.MATTERMOST_ENABLED === 'true',
            serverUrl: process.env.MATTERMOST_SERVER_URL || '',
            username: process.env.MATTERMOST_USERNAME || '',
            password: process.env.MATTERMOST_PASSWORD || '',
            token: process.env.MATTERMOST_TOKEN || '',
            commands: [
                {
                    name: process.env.MATTERMOST_COMMAND_NAME || '/SCREEN',
                    message: process.env.MATTERMOST_DEFAULT_MESSAGE || 'Here is your meeting room:',
                },
            ],
            texts: [
                {
                    name: process.env.MATTERMOST_COMMAND_NAME || '/SCREEN',
                    message: process.env.MATTERMOST_DEFAULT_MESSAGE || 'Here is your meeting room:',
                },
            ],
        },
        discord: {
            enabled: process.env.DISCORD_ENABLED === 'true',
            token: process.env.DISCORD_TOKEN || '',
            commands: [
                {
                    name: process.env.DISCORD_COMMAND_NAME || '/SCREEN',
                    message: process.env.DISCORD_DEFAULT_MESSAGE || 'Here is your SCREEN meeting room:',
                    baseUrl: process.env.DISCORD_BASE_URL || 'https://SCREEN.com/join/',
                },
            ],
        },
        ngrok: {
            enabled: process.env.NGROK_ENABLED === 'true',
            authToken: process.env.NGROK_AUTH_TOKEN || '',
        },
        sentry: {
            enabled: process.env.SENTRY_ENABLED === 'true',
            DSN: process.env.SENTRY_DSN || '',
            tracesSampleRate: Math.min(Math.max(parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE) || 0.5, 0), 1),
        },
        webhook: {
            enabled: process.env.WEBHOOK_ENABLED === 'true',
            url: process.env.WEBHOOK_URL || 'https://your-site.com/webhook-endpoint',
        },
        IPLookup: {
            enabled: process.env.IP_LOOKUP_ENABLED === 'true',
            getEndpoint(ip) {
                return `https://get.geojs.io/v1/ip/geo/${ip}.json`;
            },
        },
    },

    // 7. UI/UX Customization
    ui: {
        brand: {
            app: {
                language: process.env.UI_LANGUAGE || 'en',
                name: process.env.APP_NAME || 'SCREEN',
                title:
                    process.env.APP_TITLE ||
                    'SCREEN<br />Free browser based Real-time video calls.<br />Simple, Secure, Fast.',
                description:
                    process.env.APP_DESCRIPTION ||
                    'Start your next video call with a single click. No download, plug-in, or login is required.',
                joinDescription: process.env.JOIN_DESCRIPTION || 'Pick a room name.<br />How about this one?',
                joinButtonLabel: process.env.JOIN_BUTTON_LABEL || 'JOIN ROOM',
                joinLastLabel: process.env.JOIN_LAST_LABEL || 'Your recent room:',
            },
            site: {
                title: process.env.SITE_TITLE || 'SCREEN, Free Video Calls, Messaging and Screen Sharing',
                icon: process.env.SITE_ICON_PATH || '../images/logo.svg',
                appleTouchIcon: process.env.APPLE_TOUCH_ICON_PATH || '../images/logo.svg',
                newRoomTitle: process.env.NEW_ROOM_TITLE || 'SCREEN<br />Free browser based Real-time video calls.<br />Simple, Secure, Fast.',
                newRoomDescription:
                    process.env.NEW_ROOM_DESC || 'Each room has its disposable URL. Just pick a name and share.',
            },
            meta: {
                title: process.env.META_TITLE || 'SCREEN SFU',
                description:
                    process.env.META_DESCRIPTION ||
                    'SCREEN SFU is a free, secure, and easy-to-use video conferencing platform',
                keywords: process.env.META_KEYWORDS || 'webrtc, video calls, conference, screen sharing, SCREEN, sfu',
                siteName: process.env.META_SITE_NAME || 'SCREEN SFU',
                favicon: process.env.META_FAVICON || '../images/logo.svg',
                language: process.env.META_LANGUAGE || 'en',
                theme_color: process.env.META_THEME_COLOR || '#000000',
            },
            ogMeta: {
                title: process.env.OG_TITLE || 'SCREEN SFU',
                description: process.env.OG_DESCRIPTION || 'SCREEN SFU: Secure, simple high-quality video calls',
                type: process.env.OG_TYPE || 'website',
                image: process.env.OG_IMAGE_URL || 'https://SCREEN.com/images/SCREEN.png',
                url: process.env.OG_URL || 'https://SCREEN.com',
            },
            html: {
                features: process.env.SHOW_FEATURES !== 'false',
                teams: process.env.SHOW_TEAMS !== 'false',
                tryEasier: process.env.SHOW_TRY_EASIER !== 'false',
                poweredBy: process.env.SHOW_POWERED_BY !== 'false',
                sponsors: process.env.SHOW_SPONSORS !== 'false',
                advertisers: process.env.SHOW_ADVERTISERS !== 'false',
                footer: process.env.SHOW_FOOTER !== 'false',
            },
            about: {
                imageUrl: process.env.ABOUT_IMAGE_URL || '../images/SCREEN-logo.gif',
                title: `WebRTC SFU v${packageJson.version}`,
                html: `
                    <button id="support-button" data-umami-event="Support button"
                        onclick="window.open('${process.env.SUPPORT_URL || 'https://codecanyon.net/user/miroslavpejic85'}', '_blank')">
                        <i class="fas fa-heart"></i> ${process.env.SUPPORT_TEXT || 'Support'}
                    </button>
                    <br />
                    <br />
                    ${process.env.AUTHOR_LABEL || 'Author'}: 
                    <a id="linkedin-button" data-umami-event="Linkedin button"
                        href="${process.env.LINKEDIN_URL || 'https://www.linkedin.com/in/miroslav-pejic-976a07101/'}" 
                        target="_blank">
                        ${process.env.AUTHOR_NAME || 'Miroslav Pejic'}
                    </a>
                    <br />
                    <br />
                    ${process.env.EMAIL_LABEL || 'Email'}: 
                    <a id="email-button" data-umami-event="Email button"
                        href="mailto:${process.env.CONTACT_EMAIL || 'miroslav.pejic.85@gmail.com'}?subject=${process.env.EMAIL_SUBJECT || 'SCREEN info'}">
                        ${process.env.CONTACT_EMAIL || 'miroslav.pejic.85@gmail.com'}
                    </a>
                    <hr />
                    <span>
                        &copy; ${new Date().getFullYear()} ${process.env.COPYRIGHT_TEXT || 'SCREEN, all rights reserved'}
                    </span>
                    <hr />
                    `,
            },
        },
        buttons: {
            main: {
                shareQr: process.env.SHOW_SHARE_QR !== 'false',
                shareButton: process.env.SHOW_SHARE_BUTTON !== 'false',
                hideMeButton: process.env.SHOW_HIDE_ME !== 'false',
                startAudioButton: process.env.SHOW_AUDIO_BUTTON !== 'false',
                startVideoButton: process.env.SHOW_VIDEO_BUTTON !== 'false',
                startScreenButton: process.env.SHOW_SCREEN_BUTTON !== 'false',
                swapCameraButton: process.env.SHOW_SWAP_CAMERA !== 'false',
                chatButton: process.env.SHOW_CHAT_BUTTON !== 'false',
                pollButton: process.env.SHOW_POLL_BUTTON !== 'false',
                editorButton: process.env.SHOW_EDITOR_BUTTON !== 'false',
                raiseHandButton: process.env.SHOW_RAISE_HAND !== 'false',
                transcriptionButton: process.env.SHOW_TRANSCRIPTION !== 'false',
                whiteboardButton: process.env.SHOW_WHITEBOARD !== 'false',
                documentPiPButton: process.env.SHOW_DOCUMENT_PIP !== 'false',
                snapshotRoomButton: process.env.SHOW_SNAPSHOT !== 'false',
                emojiRoomButton: process.env.SHOW_EMOJI !== 'false',
                settingsButton: process.env.SHOW_SETTINGS !== 'false',
                aboutButton: process.env.SHOW_ABOUT !== 'false',
                exitButton: process.env.SHOW_EXIT_BUTTON !== 'false',
            },
            settings: {
                fileSharing: process.env.ENABLE_FILE_SHARING !== 'false',
                lockRoomButton: process.env.SHOW_LOCK_ROOM !== 'false',
                unlockRoomButton: process.env.SHOW_UNLOCK_ROOM !== 'false',
                broadcastingButton: process.env.SHOW_BROADCASTING !== 'false',
                lobbyButton: process.env.SHOW_LOBBY !== 'false',
                sendEmailInvitation: process.env.SHOW_EMAIL_INVITE !== 'false',
                micOptionsButton: process.env.SHOW_MIC_OPTIONS !== 'false',
                tabRTMPStreamingBtn: process.env.SHOW_RTMP_TAB !== 'false',
                tabModerator: process.env.SHOW_MODERATOR_TAB !== 'false',
                tabRecording: process.env.SHOW_RECORDING_TAB !== 'false',
                host_only_recording: process.env.HOST_ONLY_RECORDING !== 'false',
                pushToTalk: process.env.ENABLE_PUSH_TO_TALK !== 'false',
                keyboardShortcuts: process.env.SHOW_KEYBOARD_SHORTCUTS !== 'false',
                virtualBackground: process.env.SHOW_VIRTUAL_BACKGROUND !== 'false',
            },
            producerVideo: {
                videoPictureInPicture: process.env.ENABLE_PIP !== 'false',
                videoMirrorButton: process.env.SHOW_MIRROR_BUTTON !== 'false',
                fullScreenButton: process.env.SHOW_FULLSCREEN !== 'false',
                snapShotButton: process.env.SHOW_SNAPSHOT_BUTTON !== 'false',
                muteAudioButton: process.env.SHOW_MUTE_AUDIO !== 'false',
                videoPrivacyButton: process.env.SHOW_PRIVACY_TOGGLE !== 'false',
                audioVolumeInput: process.env.SHOW_VOLUME_CONTROL !== 'false',
            },
            consumerVideo: {
                videoPictureInPicture: process.env.ENABLE_PIP !== 'false',
                videoMirrorButton: process.env.SHOW_MIRROR_BUTTON !== 'false',
                fullScreenButton: process.env.SHOW_FULLSCREEN !== 'false',
                snapShotButton: process.env.SHOW_SNAPSHOT_BUTTON !== 'false',
                focusVideoButton: process.env.SHOW_FOCUS_BUTTON !== 'false',
                sendMessageButton: process.env.SHOW_SEND_MESSAGE !== 'false',
                sendFileButton: process.env.SHOW_SEND_FILE !== 'false',
                sendVideoButton: process.env.SHOW_SEND_VIDEO !== 'false',
                muteVideoButton: process.env.SHOW_MUTE_VIDEO !== 'false',
                muteAudioButton: process.env.SHOW_MUTE_AUDIO !== 'false',
                audioVolumeInput: process.env.SHOW_VOLUME_CONTROL !== 'false',
                geolocationButton: process.env.SHOW_GEO_LOCATION !== 'false',
                banButton: process.env.SHOW_BAN_BUTTON !== 'false',
                ejectButton: process.env.SHOW_EJECT_BUTTON !== 'false',
            },
            videoOff: {
                sendMessageButton: process.env.SHOW_SEND_MESSAGE !== 'false',
                sendFileButton: process.env.SHOW_SEND_FILE !== 'false',
                sendVideoButton: process.env.SHOW_SEND_VIDEO !== 'false',
                muteAudioButton: process.env.SHOW_MUTE_AUDIO !== 'false',
                audioVolumeInput: process.env.SHOW_VOLUME_CONTROL !== 'false',
                geolocationButton: process.env.SHOW_GEO_LOCATION !== 'false',
                banButton: process.env.SHOW_BAN_BUTTON !== 'false',
                ejectButton: process.env.SHOW_EJECT_BUTTON !== 'false',
            },
            chat: {
                chatPinButton: process.env.SHOW_CHAT_PIN !== 'false',
                chatMaxButton: process.env.SHOW_CHAT_MAXIMIZE !== 'false',
                chatSaveButton: process.env.SHOW_CHAT_SAVE !== 'false',
                chatEmojiButton: process.env.SHOW_CHAT_EMOJI !== 'false',
                chatMarkdownButton: process.env.SHOW_CHAT_MARKDOWN !== 'false',
                chatSpeechStartButton: process.env.SHOW_CHAT_SPEECH !== 'false',
                chatGPT: process.env.ENABLE_CHAT_GPT !== 'false',
            },
            poll: {
                pollPinButton: process.env.SHOW_POLL_PIN !== 'false',
                pollMaxButton: process.env.SHOW_POLL_MAXIMIZE !== 'false',
                pollSaveButton: process.env.SHOW_POLL_SAVE !== 'false',
            },
            participantsList: {
                saveInfoButton: process.env.SHOW_SAVE_INFO !== 'false',
                sendFileAllButton: process.env.SHOW_SEND_FILE_ALL !== 'false',
                ejectAllButton: process.env.SHOW_EJECT_ALL !== 'false',
                sendFileButton: process.env.SHOW_SEND_FILE !== 'false',
                geoLocationButton: process.env.SHOW_GEO_LOCATION !== 'false',
                banButton: process.env.SHOW_BAN_BUTTON !== 'false',
                ejectButton: process.env.SHOW_EJECT_BUTTON !== 'false',
            },
            whiteboard: {
                whiteboardLockButton: process.env.SHOW_WB_LOCK !== 'false',
            },
        },
    },

    // 8. Feature Flags
    features: {
        survey: {
            enabled: process.env.SURVEY_ENABLED === 'true',
            url: process.env.SURVEY_URL || '',
        },
        redirect: {
            enabled: process.env.REDIRECT_ENABLED === 'true',
            url: process.env.REDIRECT_URL || '',
        },
        stats: {
            enabled: process.env.STATS_ENABLED !== 'false',
            src: process.env.STATS_SRC || 'https://stats.SCREEN.com/script.js',
            id: process.env.STATS_ID || '41d26670-f275-45bb-af82-3ce91fe57756',
        },
    },

    // 9. Mediasoup (WebRTC) Configuration
    mediasoup: {
        worker: {
            rtcMinPort: RTC_MIN_PORT,
            rtcMaxPort: RTC_MAX_PORT,
            disableLiburing: false,
            logLevel: process.env.MEDIASOUP_LOG_LEVEL || 'error',
            logTags: [
                'info',
                'ice',
                'dtls',
                'rtp',
                'srtp',
                'rtcp',
                'rtx',
                'bwe',
                'score',
                'simulcast',
                'svc',
                'sctp',
            ],
        },
        numWorkers: NUM_WORKERS,
        router: {
            audioLevelObserverEnabled: true,
            activeSpeakerObserverEnabled: false,
            mediaCodecs: [
                {
                    kind: 'audio',
                    mimeType: 'audio/opus',
                    clockRate: 48000,
                    channels: 2,
                },
                {
                    kind: 'video',
                    mimeType: 'video/VP8',
                    clockRate: 90000,
                    parameters: {
                        'x-google-start-bitrate': 1000,
                    },
                },
                {
                    kind: 'video',
                    mimeType: 'video/VP9',
                    clockRate: 90000,
                    parameters: {
                        'profile-id': 0,
                        'x-google-start-bitrate': 1000,
                    },
                },
                {
                    kind: 'video',
                    mimeType: 'video/VP9',
                    clockRate: 90000,
                    parameters: {
                        'profile-id': 2,
                        'x-google-start-bitrate': 1000,
                    },
                },
                {
                    kind: 'video',
                    mimeType: 'video/h264',
                    clockRate: 90000,
                    parameters: {
                        'packetization-mode': 1,
                        'profile-level-id': '42e01f',
                        'level-asymmetry-allowed': 1,
                        'x-google-start-bitrate': 1000,
                    },
                },
                {
                    kind: 'video',
                    mimeType: 'video/h264',
                    clockRate: 90000,
                    parameters: {
                        'packetization-mode': 1,
                        'profile-level-id': '4d0032',
                        'level-asymmetry-allowed': 1,
                        'x-google-start-bitrate': 1000,
                    },
                },
            ],
        },
        webRtcServerActive: process.env.SFU_SERVER === 'true',
        webRtcServerOptions: {
            listenInfos: [
                {
                    protocol: 'udp',
                    ip: LISTEN_IP,
                    announcedAddress: IPv4,
                    portRange: {
                        min: RTC_MIN_PORT,
                        max: RTC_MIN_PORT + NUM_WORKERS,
                    },
                },
                {
                    protocol: 'tcp',
                    ip: LISTEN_IP,
                    announcedAddress: IPv4,
                    portRange: {
                        min: RTC_MIN_PORT,
                        max: RTC_MIN_PORT + NUM_WORKERS,
                    },
                },
            ],
        },
        webRtcTransport: {
            listenInfos: [
                {
                    protocol: 'udp',
                    ip: LISTEN_IP,
                    announcedAddress: IPv4,
                    portRange: {
                        min: RTC_MIN_PORT,
                        max: RTC_MAX_PORT,
                    },
                },
                {
                    protocol: 'tcp',
                    ip: LISTEN_IP,
                    announcedAddress: IPv4,
                    portRange: {
                        min: RTC_MIN_PORT,
                        max: RTC_MAX_PORT,
                    },
                },
            ],
            initialAvailableOutgoingBitrate: 2500000,
            minimumAvailableOutgoingBitrate: 1000000,
            maxIncomingBitrate: 3000000,
            maxSctpMessageSize: 262144,
        },
    },
};

// ==============================================
// Helper Functions
// ==============================================

/**
 * Get IPv4 Address
 * ----------------
 * - Prioritizes PUBLIC_IP if set
 * - Falls back to local IP detection
 */
function getIPv4() {
    if (PUBLIC_IP) return PUBLIC_IP;

    switch (ENVIRONMENT) {
        case 'development':
            return IS_DOCKER ? '127.0.0.1' : getLocalIPv4();
        case 'production':
            return PUBLIC_IP;
        default:
            return getLocalIPv4();
    }
}

/**
 * Detect Local IPv4 Address
 * -------------------------
 * - Handles different OS network interfaces
 * - Filters out virtual/docker interfaces
 */
function getLocalIPv4() {
    const ifaces = os.networkInterfaces();
    const platform = os.platform();

    const PRIORITY_CONFIG = {
        win32: [{ name: 'Ethernet' }, { name: 'Wi-Fi' }, { name: 'Local Area Connection' }],
        darwin: [{ name: 'en0' }, { name: 'en1' }],
        linux: [{ name: 'eth0' }, { name: 'wlan0' }],
    };

    const VIRTUAL_INTERFACES = {
        all: ['docker', 'veth', 'tun', 'lo'],
        win32: ['Virtual', 'vEthernet', 'Teredo', 'Bluetooth'],
        darwin: ['awdl', 'bridge', 'utun'],
        linux: ['virbr', 'kube', 'cni'],
    };

    const platformPriorities = PRIORITY_CONFIG[platform] || [];
    const virtualExcludes = [...VIRTUAL_INTERFACES.all, ...(VIRTUAL_INTERFACES[platform] || [])];

    // Check priority interfaces first
    for (const { name: ifName } of platformPriorities) {
        const matchingIfaces = platform === 'win32' ? Object.keys(ifaces).filter((k) => k.includes(ifName)) : [ifName];
        for (const interfaceName of matchingIfaces) {
            const addr = findValidAddress(ifaces[interfaceName]);
            if (addr) return addr;
        }
    }

    // Fallback to scanning all non-virtual interfaces
    const fallbackAddress = scanAllInterfaces(ifaces, virtualExcludes);
    if (fallbackAddress) return fallbackAddress;

    return '0.0.0.0';
}

/**
 * Scan All Network Interfaces
 * ---------------------------
 * - Checks all interfaces excluding virtual ones
 */
function scanAllInterfaces(ifaces, excludes) {
    for (const [name, addresses] of Object.entries(ifaces)) {
        if (excludes.some((ex) => name.toLowerCase().includes(ex.toLowerCase()))) {
            continue;
        }
        const addr = findValidAddress(addresses);
        if (addr) return addr;
    }
    return null;
}

/**
 * Find Valid Network Address
 * --------------------------
 * - Filters out internal and link-local addresses
 */
function findValidAddress(addresses) {
    return addresses?.find((addr) => addr.family === 'IPv4' && !addr.internal && !addr.address.startsWith('169.254.'))
        ?.address;
}

/**
 * Get FFmpeg Path
 * ---------------
 * - Checks common installation locations
 * - Platform-specific paths
 */
function getFFmpegPath(platform) {
    const paths = {
        darwin: ['/usr/local/bin/ffmpeg', '/opt/homebrew/bin/ffmpeg'],
        linux: ['/usr/bin/ffmpeg', '/usr/local/bin/ffmpeg'],
        win32: ['C:\\ffmpeg\\bin\\ffmpeg.exe', 'C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe'],
    };

    const platformPaths = paths[platform] || ['/usr/bin/ffmpeg'];

    for (const path of platformPaths) {
        try {
            fs.accessSync(path);
            return path;
        } catch (e) {
            continue;
        }
    }

    return platformPaths[0];
}
