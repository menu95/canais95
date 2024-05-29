document.addEventListener('DOMContentLoaded', () => {
    const playerContainer = document.getElementById('player-container');
    const videoPlayer = document.getElementById('video-player');
    const videoSource = document.getElementById('video-source');
    const channelList = document.getElementById('channel-list');
    const channelItems = channelList.querySelectorAll('li');
    const epg = document.getElementById('epg');
    const epgList = document.getElementById('epg-list');
    let currentIndex = 0;
    let closeListTimeout;

    // Function to update the visual selection of the channel
    const updateVisualSelection = () => {
        channelItems.forEach((item, index) => {
            if (index === currentIndex) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    };

    // Function to update the video source
    const updateVideoSource = () => {
        const selectedItem = channelItems[currentIndex];
        const newSrc = selectedItem.getAttribute('data-src');
        videoSource.setAttribute('src', newSrc);
        videoPlayer.load();
    };

    // Function to start the timeout for closing the channel list
    const startCloseListTimeout = () => {
        clearTimeout(closeListTimeout);
        closeListTimeout = setTimeout(() => {
            channelList.style.left = '-300px';
        }, 4000);
    };

    // Function to load EPG data
    const loadEPG = (channel) => {
        fetch('epg.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                epgList.innerHTML = '';
                if (data[channel]) {
                    data[channel].forEach(program => {
                        const li = document.createElement('li');
                        li.textContent = `${program.time} - ${program.title}`;
                        epgList.appendChild(li);
                    });
                } else {
                    const li = document.createElement('li');
                    li.textContent = 'No programming information available';
                    epgList.appendChild(li);
                }
            })
            .catch(error => {
                console.error('There has been a problem with your fetch operation:', error);
            });
    };

    // Function to update the program info below each channel
    const updateProgramInfo = () => {
        fetch('epg.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                channelItems.forEach(item => {
                    const channel = item.getAttribute('data-channel');
                    const programInfoElement = item.querySelector('.program-info');
                    if (data[channel] && data[channel].length > 0) {
                        programInfoElement.textContent = data[channel][0].title;
                    } else {
                        programInfoElement.textContent = '';
                    }
                });
            })
            .catch(error => {
                console.error('There has been a problem with your fetch operation:', error);
            });
    };

    // Initialize first channel as visually selected
    updateVisualSelection();
    updateProgramInfo();

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            if (channelList.style.left === '0px') {
                // Load the selected video and hide the channel list
                updateVideoSource();
                channelList.style.left = '-300px';
            } else {
                // Show the channel list and start the timeout
                channelList.style.left = '0';
                startCloseListTimeout();
            }
        } else if (e.key === 'ArrowDown') {
            if (channelList.style.left === '0px') {
                currentIndex = (currentIndex + 1) % channelItems.length;
                updateVisualSelection();
                startCloseListTimeout();
            }
        } else if (e.key === 'ArrowUp') {
            if (channelList.style.left === '0px') {
                currentIndex = (currentIndex - 1 + channelItems.length) % channelItems.length;
                updateVisualSelection();
                startCloseListTimeout();
            }
        } else if (e.key === 'ArrowRight') {
            if (channelList.style.left === '0px') {
                // Show the EPG for the selected channel
                epg.style.right = '0';
                const selectedChannel = channelItems[currentIndex].getAttribute('data-channel');
                loadEPG(selectedChannel);
            }
        } else if (e.key === 'ArrowLeft') {
            if (epg.style.right === '0px') {
                // Hide the EPG
                epg.style.right = '-300px';
            }
        }
    });

    channelItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            currentIndex = index;
            updateVisualSelection();
            // No need to hide the channel list here, since Enter will trigger the update
        });
    });

    // Reset the timeout when the mouse is moved within the channel list
    channelList.addEventListener('mousemove', startCloseListTimeout);
});
