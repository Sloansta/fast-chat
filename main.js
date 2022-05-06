let APP_ID = "";

let token = null;
let uid = Math.floor(Math.random() * 10000).toString();

let client;
let channel;

let localStream;
let remoteStream;
let peerConnection;

const servers = {
    iceServers: [
        {
            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
        }
    ]
}
const init = async () => {
    client = await AgoraRTM.createInstance(APP_ID);
    await client.login({uid, token});

    // index.html?room=234234 or something like this. For now, it is being called main :D
    channel = client.createChannel('main');
    await channel.join();

    channel.on('MemberJoined', handleUserJoined)

    localStream = await navigator.mediaDevices.getUserMedia({video: true, audio: false});
    document.getElementById('user-1').srcObject = localStream;

    createOffer();
};

const handleUserJoined = async (memberId) => {
    console.log('A new user has joined the channel:', memberId);
};


const createOffer = async () => {
    peerConnection = new RTCPeerConnection(servers);

    remoteStream = new MediaStream();
    document.getElementById('user-2').srcObject = remoteStream;

    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
    });

    peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track);
        });
    };

    peerConnection.onicecandidate = async (event) => {
        if(event.candidate) {
            console.log('New ICE candidate:', event.candidate);
        }
    };

    let offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    console.log('offer:', offer);

};

init();