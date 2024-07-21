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
    return `https://camstills.${SL_DOMAIN}/${id}/latest_full.jpg`;
  }

  data.forEach((v) => {
    const previewWrapper = document.createElement("div");
    previewWrapper.className = "preview-container";

    const imgElement = document.createElement("img");
    imgElement.className = "preview";
    imgElement.src = v.img;
    imgElement.alt = v.name;
    imgElement.addEventListener("click", () => setMainVideo(v.video));

    const nameBar = document.createElement("div");
    nameBar.className = "preview-name";
    nameBar.textContent = v.name;

    previewWrapper.appendChild(imgElement);
    previewWrapper.appendChild(nameBar);
    previewContainer.appendChild(previewWrapper);
  });

  setMainVideo(data.get("au-manlynorth").video);

  function setMainVideo(src) {
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(mainVideo);
    } else if (mainVideo.canPlayType("application/vnd.apple.mpegurl")) {
      mainVideo.src = src;
    }
  }
});
