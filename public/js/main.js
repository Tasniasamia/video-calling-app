const createUserBtn = document.getElementById("create-user");
const username = document.getElementById("username");
const allusersHtml = document.getElementById("allusers");
const videoStreamsContainer = document.getElementById("video-streams");
const socket = io();
let localStream;
let activeVideos = {}; // track করবে কোন user এর video চলছে

// handle browser events
createUserBtn.addEventListener("click", (e) => {
    if(username.value !== "") {
        socket.emit("join-user", username.value);
    }
});

// handle socket events
socket.on("joined", allusers => {
    console.log({ allusers });
    const createUsersHtml = () => {
        allusersHtml.innerHTML = "";

        for(const user in allusers) {
            const li = document.createElement("li");
            
            const span = document.createElement("span");
            span.textContent = `${user} ${user === username.value ? "(You)" : ""}`;
            li.appendChild(span);

            if(user !== username.value) {
                const button = document.createElement("button");
                button.classList.add("call-btn");
                button.addEventListener("click", (e) => {
                    startCall(user);
                });
                const img = document.createElement("img");
                img.setAttribute("src", "/images/phone.png");
                img.setAttribute("width", 20);
                img.setAttribute("alt", "Call");

                button.appendChild(img);
                li.appendChild(button);
            }

            allusersHtml.appendChild(li);
        }
    }

    createUsersHtml();
});

// start call method - নতুন video element create করবে
const startCall = async (user) => {
    console.log("Starting call with:", user);
    
    // যদি already এই user এর video চলছে, তাহলে return
    if(activeVideos[user]) {
        console.log(`Video already active for ${user}`);
        return;
    }
    
    // Local stream check করো
    if(!localStream) {
        alert("Please wait, camera is loading...");
        return;
    }
    
    // নতুন video wrapper create করো
    const videoWrapper = document.createElement("div");
    videoWrapper.classList.add("video-wrapper");
    videoWrapper.id = `video-${user}`;
    
    // Video element create করো
    const video = document.createElement("video");
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    video.srcObject = localStream;
    
    // Label add করো
    const label = document.createElement("div");
    label.classList.add("video-label");
    label.textContent = `Call with ${user}`;
    
    // Close button add করো
    const closeBtn = document.createElement("button");
    closeBtn.classList.add("close-video-btn");
    closeBtn.textContent = "×";
    closeBtn.addEventListener("click", () => {
        endCall(user);
    });
    
    // সব elements একসাথে add করো
    videoWrapper.appendChild(video);
    videoWrapper.appendChild(label);
    videoWrapper.appendChild(closeBtn);
    videoStreamsContainer.appendChild(videoWrapper);
    
    // Track করো যে এই user এর video active
    activeVideos[user] = videoWrapper;
}

// end call method - specific user এর video remove করবে
const endCall = (user) => {
    if(activeVideos[user]) {
        const videoWrapper = activeVideos[user];
        
        // Video stream stop করো
        const video = videoWrapper.querySelector("video");
        if(video && video.srcObject) {
            video.srcObject = null;
        }
        
        // Element remove করো
        videoWrapper.remove();
        
        // Tracking থেকে remove করো
        delete activeVideos[user];
        
        console.log(`Call ended with ${user}`);
    }
}

// initialize app
const startMyVideo = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: true, 
            video: true 
        });
        console.log({ stream });
        localStream = stream;
        
        // নিজের video দেখাও (optional - তুমি চাইলে এটা রাখতে পারো বা বাদ দিতে পারো)
        const myVideoWrapper = document.createElement("div");
        myVideoWrapper.classList.add("video-wrapper");
        myVideoWrapper.id = "my-video";
        
        const myVideo = document.createElement("video");
        myVideo.autoplay = true;
        myVideo.muted = true;
        myVideo.playsInline = true;
        myVideo.srcObject = stream;
        
        const myLabel = document.createElement("div");
        myLabel.classList.add("video-label");
        myLabel.textContent = "You";
        
        myVideoWrapper.appendChild(myVideo);
        myVideoWrapper.appendChild(myLabel);
        videoStreamsContainer.appendChild(myVideoWrapper);
        
    } catch(error) {
        console.error("Error accessing media devices:", error);
        alert("Cannot access camera/microphone. Please allow permissions.");
    }
}

startMyVideo();