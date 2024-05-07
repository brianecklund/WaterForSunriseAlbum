document.addEventListener('DOMContentLoaded', function () {
    const minWeightCenter = 100;
    const maxWeightCenter = 1000;
    const maxDistanceCenter = 600;
    const minWeightSignature = 100;
    const maxWeightSignature = 1000;
    const maxDistanceSignature = 150;
    const fallingTextContainer = document.getElementById("falling-text-container");
    const fallingText = document.getElementById("falling-text");
    const myAudio = document.getElementById('my-audio');
    const trackList = document.getElementById('track-list').getElementsByTagName('li');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const previousTrackBtn = document.getElementById('previous-track-btn');
    const nextTrackBtn = document.getElementById('next-track-btn');
    const muteBtn = document.getElementById('mute-btn');
    const seekBar = document.getElementById('seek-bar');
    const fullscreenMenu = document.getElementById('fullscreen-menu');
    const aboutMenu = document.getElementById('about-menu');
    const menuBtn = document.getElementById('menu-toggle-btn');
    const aboutBtn = document.getElementById('about-toggle-btn');
    const animatedTextDiv = document.querySelector('.animated-text');
    let currentTrackIndex = 0;
    let hasPlayedFirstTrack = false;
    let lastPressTime = 0;

    // Initialize variables
    const currentTimeSpan = document.getElementById('current-time');
    const remainingTimeSpan = document.getElementById('remaining-time');

    myAudio.addEventListener('timeupdate', function () {
        const currentTime = myAudio.currentTime;
        const duration = myAudio.duration;

        // Update current time and remaining time
        currentTimeSpan.textContent = formatTime(currentTime);
        remainingTimeSpan.textContent = formatTime(duration - currentTime);

        // Update seek bar
        const position = currentTime / duration;
        seekBar.value = position * 100;
    });

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    seekBar.addEventListener('input', function () {
        const time = myAudio.duration * (this.value / 100);
        myAudio.currentTime = time;
        currentTimeSpan.textContent = formatTime(time);
        remainingTimeSpan.textContent = formatTime(myAudio.duration - time);
    });

    function playTrack(index, fadeIn = true) {
        if (index < trackList.length) {
            // Highlight the current track
            for (let i = 0; i < trackList.length; i++) {
                trackList[i].classList.remove('active-track');
            }
            trackList[index].classList.add('active-track');

            // Set up the track for playback
            const trackElement = trackList[index];
            const title = trackElement.innerHTML.split('<span')[0].trim().split(". ")[1];
            if (fadeIn) {
                fadeCenterText(title, function() {
                    myAudio.src = trackElement.getAttribute('data-track');
                    myAudio.play();
                    currentTrackIndex = index;
                });
            } else {
                updateCenterText(title);
                myAudio.src = trackElement.getAttribute('data-track');
                myAudio.play();
                currentTrackIndex = index;
            }
            closeMenu(fullscreenMenu, menuBtn, 'Tracklist'); // Close the menu after selecting a track
        }
    }

    function playPreviousTrack() {
        if (currentTrackIndex === 0 || myAudio.currentTime > 3) {
            myAudio.currentTime = 0;
            myAudio.play();
        } else {
            currentTrackIndex--;
            playTrack(currentTrackIndex);
        }
    }

    function playNextTrack() {
        if (currentTrackIndex < trackList.length - 1) {
            currentTrackIndex++;
            playTrack(currentTrackIndex);
        }
    }

    previousTrackBtn.addEventListener('click', function () {
        const now = Date.now();
        if (now - lastPressTime <= 3000 && currentTrackIndex > 0) {
            playPreviousTrack();
        } else {
            myAudio.currentTime = 0;
            myAudio.play();
        }
        lastPressTime = now;
    });

    nextTrackBtn.addEventListener('click', function () {
        playNextTrack();
    });

    function fadeCenterText(newText, callback) {
        animatedTextDiv.classList.add('fade-out');

        setTimeout(() => {
            updateCenterText(newText);
            animatedTextDiv.classList.remove('fade-out');
            animatedTextDiv.classList.add('fade-in');
            setTimeout(() => {
                animatedTextDiv.classList.remove('fade-in');
                if (callback) callback();
            }, 1000);
        }, 1000);
    }

    function updateCenterText(text) {
        animatedTextDiv.innerHTML = ''; // Clear existing content

        // Create new spans for each character in the track title
        for (let i = 0; i < text.length; i++) {
            const span = document.createElement('span');
            span.textContent = text[i];
            if (text[i] === ' ') span.className = 'word-spacing';
            animatedTextDiv.appendChild(span);
        }
    }

    function openMenu(menu, button, closeText) {
        menu.classList.add("show");
        button.textContent = closeText;
        document.body.classList.add('menu-open');
    }

    function closeMenu(menu, button, defaultText) {
        menu.classList.remove("show");
        button.textContent = defaultText;
        document.body.classList.remove('menu-open');
    }

    function toggleMenu(menuToShow, otherMenu, button, otherButton, defaultText, otherDefaultText) {
        if (menuToShow.classList.contains("show")) {
            closeMenu(menuToShow, button, defaultText);
        } else {
            openMenu(menuToShow, button, 'Close');
            closeMenu(otherMenu, otherButton, otherDefaultText);
        }
    }

    // Menu button functionality
    menuBtn.addEventListener('click', function () {
        toggleMenu(fullscreenMenu, aboutMenu, menuBtn, aboutBtn, 'Tracklist', 'About');
    });

    // About button functionality
    aboutBtn.addEventListener('click', function () {
        toggleMenu(aboutMenu, fullscreenMenu, aboutBtn, menuBtn, 'About', 'Tracklist');
    });

    // Track selection
    for (let i = 0; i < trackList.length; i++) {
        trackList[i].addEventListener('click', function () {
            const trackIndex = Array.prototype.indexOf.call(trackList, this);
            playTrack(trackIndex);
            hasPlayedFirstTrack = true;
        });
    }

    // Auto-play the first track when the user clicks for the first time
    document.addEventListener('click', function (event) {
        const clickedInsideAudioPlayer = event.target.closest('.menu-btn, .bottom-center-audio-player, #fullscreen-menu, .about-btn, #about-menu');
        if (!hasPlayedFirstTrack && !clickedInsideAudioPlayer) {
            fadeCenterText(trackList[0].innerHTML.split('<span')[0].trim().split(". ")[1], function() {
                playTrack(0, false);
            });
            hasPlayedFirstTrack = true;
        }
    });

    // Auto-play next track when current one ends
    myAudio.addEventListener('ended', function () {
        if (currentTrackIndex + 1 < trackList.length) {
            playTrack(currentTrackIndex + 1);
        }
    });

    // Play/Pause button functionality
    playPauseBtn.addEventListener('click', function () {
        if (myAudio.paused) {
            myAudio.play();
            this.textContent = 'Pause';
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
        char.addEventListener('mouseleave', function () {
            this.style.fontVariationSettings = `'wght' ${minWeightCenter}`;
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
