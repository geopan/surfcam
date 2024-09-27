document.addEventListener("DOMContentLoaded", () => {
  const previewContainer = document.getElementById("previewContainer");
  const mainVideo = document.getElementById("mainVideo");

  const cam = [
    { id: "au-manlynorth", name: "Manly North Steyne" },
    { id: "au-manlyhotel", name: "Manly South Steyne" },
    { id: "au-manlyfairy", name: "Fairy Bower" },
    { id: "au-freshwater", name: "Freshwater" },
    { id: "au-queenscliff", name: "Queenscliff" },
    { id: "au-deewhy", name: "Dee Why" },
    { id: "au-curlcurl", name: "Curl Curl" },
  ];

  const SL_DOMAIN = "cdn-surfline.com";

  const data = cam.reduce((acc, cur) => {
    return acc.set(cur.id, {
      name: cur.name,
      video: setVideoSource(cur.id),
      img: setImgSource(cur.id),
    });
  }, new Map());

  function setVideoSource(id) {
    return `https://cams.${SL_DOMAIN}/cdn-au/${id}/playlist.m3u8`;
  }

  function setImgSource(id) {
    return `https://camstills.${SL_DOMAIN}/${id}/latest_small.jpg`;
  }

  // Initialize Hls instance outside of the function
  let hls;
  let currentSelectedPreview = null; // Keep track of the currently selected preview

  function setMainVideo(src) {
    if (hls) {
      hls.destroy();
    }

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.on(Hls.Events.ERROR, function (event, data) {
        console.error("HLS error:", data);
        alert("An error occurred while playing the video.");
      });
      hls.loadSource(src);
      hls.attachMedia(mainVideo);
    } else if (mainVideo.canPlayType("application/vnd.apple.mpegurl")) {
      mainVideo.src = src;
    } else {
      alert("Your browser does not support HLS playback.");
    }

    // Save the current video source
    localStorage.setItem("lastVideoSrc", src);
  }

  function setSelectedPreview(previewElement) {
    // Remove 'selected' class from previously selected preview
    if (currentSelectedPreview) {
      currentSelectedPreview.classList.remove("selected");
    }
    // Add 'selected' class to the new preview
    previewElement.classList.add("selected");
    // Update current selected preview
    currentSelectedPreview = previewElement;
  }

  const lastVideoSrc = localStorage.getItem("lastVideoSrc");

  data.forEach((v) => {
    const previewWrapper = document.createElement("div");
    previewWrapper.className = "preview-container";
    previewWrapper.dataset.videoSrc = v.video; // Store video source in data attribute

    const imgElement = document.createElement("img");
    imgElement.className = "preview";
    imgElement.src = v.img;
    imgElement.alt = v.name;
    imgElement.loading = "lazy";
    imgElement.addEventListener("click", () => {
      setMainVideo(v.video);
      setSelectedPreview(previewWrapper);
    });

    // Handle image errors
    imgElement.onerror = function () {
      this.src = "placeholder.png";
    };

    imgElement.tabIndex = 0; // Make images focusable

    imgElement.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        setMainVideo(v.video);
        setSelectedPreview(previewWrapper);
      }
    });

    const nameBar = document.createElement("div");
    nameBar.className = "preview-name";
    nameBar.textContent = v.name;

    previewWrapper.appendChild(imgElement);
    previewWrapper.appendChild(nameBar);
    previewContainer.appendChild(previewWrapper);
  });

  // Load the default or last selected video
  if (lastVideoSrc) {
    setMainVideo(lastVideoSrc);
    // Find and select the corresponding preview
    const selectedPreview = Array.from(document.querySelectorAll(".preview-container")).find(
      (preview) => preview.dataset.videoSrc === lastVideoSrc
    );
    if (selectedPreview) {
      setSelectedPreview(selectedPreview);
    }
  } else {
    // Default to the first cam in the list
    const defaultCam = cam[0];
    const defaultVideoSrc = data.get(defaultCam.id).video;
    setMainVideo(defaultVideoSrc);
    // Find and select the corresponding preview
    const defaultPreview = Array.from(document.querySelectorAll(".preview-container")).find(
      (preview) => preview.dataset.videoSrc === defaultVideoSrc
    );
    if (defaultPreview) {
      setSelectedPreview(defaultPreview);
    }
  }
});