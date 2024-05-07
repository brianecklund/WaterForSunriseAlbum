document.addEventListener('DOMContentLoaded', function () {
    const minWeightCenter = 100;
    const maxWeightCenter = 1000;
    const maxDistanceCenter = 600;
    const minWeightSignature = 100;
    const maxWeightSignature = 1000;
    const maxDistanceSignature = 150;
    const fallingTextContainer = document.getElementById("falling-text-container");
    const fallingText = document.getElementById("falling-text");
    let isFirstClick = true;
    const myAudio = document.getElementById('my-audio');
    const trackList = document.getElementById('track-list').getElementsByTagName('li');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const muteBtn = document.getElementById('mute-btn');
    const seekBar = document.getElementById('seek-bar');
    const menuBtn = document.getElementById('menu-toggle-btn');
    const fullscreenMenu = document.getElementById('fullscreen-menu');
    let isMenuOpen = false;
    let currentTrackIndex = 0;

    function showFallingText() {
        fallingTextContainer.style.display = "block";
        fallingText.classList.remove("falling-text");
        void fallingText.offsetWidth; // Trigger reflow for animation restart
        fallingText.classList.add("falling-text");
    }

    function playTrack(index) {
        if (index < trackList.length) {
            const trackElement = trackList[index];
            myAudio.src = trackElement.getAttribute('data-track');
            myAudio.play();
            currentTrackIndex = index;
            // Remove the track number and only display the title
            const title = trackElement.innerHTML.split('<span')[0].trim().split(". ")[1];
            updateCenterText(title); // Only the title
            showFallingText();
            closeMenu(); // Close the menu after selecting a track
            isFirstClick = false;
        }
    }

    function updateCenterText(text) {
        const animatedTextDiv = document.querySelector('.animated-text');
        animatedTextDiv.innerHTML = ''; // Clear existing content

        // Create new spans for each character in the track title
        for (let i = 0; i < text.length; i++) {
            const span = document.createElement('span');
            span.textContent = text[i];
            if (text[i] === ' ') span.className = 'word-spacing';
            animatedTextDiv.appendChild(span);
        }
    }

    function openMenu() {
        isMenuOpen = true;
        fullscreenMenu.classList.add("show");
        menuBtn.textContent = 'Close';
        document.body.classList.add('menu-open');
    }

    function closeMenu() {
        isMenuOpen = false;
        fullscreenMenu.classList.remove("show");
        menuBtn.textContent = 'Tracklist';
        document.body.classList.remove('menu-open');
    }

    // Menu button functionality
    menuBtn.addEventListener('click', function () {
        if (isMenuOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    // Track selection
    for (let i = 0; i < trackList.length; i++) {
        trackList[i].addEventListener('click', function () {
            const trackIndex = Array.prototype.indexOf.call(trackList, this);
            playTrack(trackIndex);
        });
    }

    // Auto-play the first track when the user clicks for the first time
    document.addEventListener('click', function (event) {
        if (isFirstClick && !event.target.closest('.menu-btn, .bottom-center-audio-player, #fullscreen-menu')) {
            playTrack(0);
            showFallingText();
        }
    });

    // Auto-play next track when current one ends
    myAudio.addEventListener('ended', function () {
        if (currentTrackIndex + 1 < trackList.length) {
            playTrack(currentTrackIndex + 1);
            showFallingText();
        }
    });

    // Play/Pause button functionality
    playPauseBtn.addEventListener('click', function () {
        if (myAudio.paused) {
            myAudio.play();
            this.textContent = 'Pause';
            showFallingText();
        } else {
            myAudio.pause();
            this.textContent = 'Play';
        }
    });

    // Mute/Unmute button functionality
    muteBtn.addEventListener('click', function () {
        myAudio.muted = !myAudio.muted;
        this.textContent = myAudio.muted ? 'Unmute' : 'Mute';
    });

    // Seek bar functionality
    myAudio.addEventListener('timeupdate', function () {
        const position = myAudio.currentTime / myAudio.duration;
        seekBar.value = position * 100;
    });

    seekBar.addEventListener('input', function () {
        const time = myAudio.duration * (this.value / 100);
        myAudio.currentTime = time;
    });

    // Mouse movement event listener for animated text
    document.addEventListener('mousemove', function (event) {
        document.querySelectorAll('.animated-text span').forEach(function (char) {
            applyFontWeightEffect(char, event);
        });

        document.querySelectorAll('.signature span').forEach(function (char) {
            applyFontWeightEffect(char, event);
        });
    });

    // Reset font weight when cursor leaves
    document.querySelectorAll('.animated-text span, .signature span').forEach(function (char) {
        char.addEventlistener('mouseleave', function () {
            this.style.fontVariationSettings = `'wght' ${minWeightCenter}`; // or minWeightSignature as appropriate
        });
    });

    function applyFontWeightEffect(element, event) {
        const rect = element.getBoundingClientRect();
        const distanceX = Math.abs(event.clientX - (rect.left + rect.width / 2));
        const distanceY = Math.abs(event.clientY - (rect.top + rect.height / 2));
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
        let weight = minWeightCenter;
        if (distance < maxDistanceCenter) {
            weight = maxWeightCenter - (distance / maxDistanceCenter) * (maxWeightCenter - minWeightCenter);
        }
        element.style.fontVariationSettings = `'wght' ${weight}`;
    }
});
