/**
 * Marvel Omniverse Nexus - Main Application Controller
 */

class MarvelNexusApp {
    constructor() {
        this.data = window.MARVEL_DATA;
        this.oracle = new window.MarvelOracle(this.data);
        this.currentTab = 'oracle';
        this.movieSort = 'release'; // 'release' or 'chronological'
        this.moviePhaseFilter = 'all';
        this.soundEnabled = true;

        this.initAudio();
        this.initDOMElements();
        this.bindEvents();
        this.renderAll();
    }

    initAudio() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContext();
        } catch (e) {
            console.log("Web Audio not supported or allowed yet");
            this.audioCtx = null;
        }
    }

    playHudSound(type = 'click') {
        if (!this.soundEnabled || !this.audioCtx) return;
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }

        const now = this.audioCtx.currentTime;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        if (type === 'click') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
            osc.start(now);
            osc.stop(now + 0.05);
        } else if (type === 'scan') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.linearRampToValueAtTime(880, now + 0.12);
            gain.gain.setValueAtTime(0.06, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
            osc.start(now);
            osc.stop(now + 0.12);
        } else if (type === 'beep') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1400, now);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            osc.start(now);
            osc.stop(now + 0.08);
        }
    }

    initDOMElements() {
        this.tabButtons = document.querySelectorAll('.nav-tab-btn');
        this.tabContents = document.querySelectorAll('.tab-view');
        this.queryInput = document.getElementById('oracle-query-input');
        this.queryBtn = document.getElementById('oracle-submit-btn');
        this.queryResultsContainer = document.getElementById('oracle-results-view');
        this.suggestedChips = document.querySelectorAll('.prompt-chip');
        this.modal = document.getElementById('detail-modal');
        this.modalContent = document.getElementById('modal-inner-content');
        this.modalClose = document.getElementById('modal-close-btn');

        // Containers
        this.moviesGrid = document.getElementById('movies-grid');
        this.storylinesGrid = document.getElementById('storylines-grid');
        this.charactersGrid = document.getElementById('characters-grid');
        this.comicRunsGrid = document.getElementById('comic-runs-grid');

        // Settings / API Key
        this.settingsBtn = document.getElementById('settings-btn');
        this.settingsModal = document.getElementById('settings-modal');
        this.settingsClose = document.getElementById('settings-close-btn');
        this.apiKeyInput = document.getElementById('gemini-api-key-input');
        this.saveApiKeyBtn = document.getElementById('save-api-key-btn');
        this.apiStatusText = document.getElementById('api-status-text');
        this.soundToggleBtn = document.getElementById('sound-toggle-btn');
    }

    bindEvents() {
        // Tab switching
        this.tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                this.switchTab(tab);
                this.playHudSound('click');
            });
        });

        // Search / Oracle submit
        this.queryBtn.addEventListener('click', () => this.handleQuerySubmit());
        this.queryInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.handleQuerySubmit();
            }
        });

        // Suggested Prompt Chips
        this.suggestedChips.forEach(chip => {
            chip.addEventListener('click', () => {
                const prompt = chip.dataset.prompt || chip.innerText.replace(/[✨🎬📖⚡]/g, '').trim();
                this.queryInput.value = prompt;
                this.handleQuerySubmit();
                this.playHudSound('scan');
            });
        });

        // Modal close
        this.modalClose.addEventListener('click', () => {
            this.closeModal();
            this.playHudSound('click');
        });
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
            if (e.target === this.settingsModal) this.closeSettingsModal();
        });

        // Movie Filters
        const sortSelect = document.getElementById('movie-sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.movieSort = e.target.value;
                this.renderMovies();
                this.playHudSound('click');
            });
        }

        const phaseSelect = document.getElementById('movie-phase-select');
        if (phaseSelect) {
            phaseSelect.addEventListener('change', (e) => {
                this.moviePhaseFilter = e.target.value;
                this.renderMovies();
                this.playHudSound('click');
            });
        }

        // Settings Modal
        if (this.settingsBtn) {
            this.settingsBtn.addEventListener('click', () => {
                this.openSettingsModal();
                this.playHudSound('click');
            });
        }
        if (this.settingsClose) {
            this.settingsClose.addEventListener('click', () => {
                this.closeSettingsModal();
                this.playHudSound('click');
            });
        }
        if (this.saveApiKeyBtn) {
            this.saveApiKeyBtn.addEventListener('click', () => {
                const key = this.apiKeyInput.value;
                this.oracle.setApiKey(key);
                this.updateApiStatusUI();
                this.playHudSound('beep');
                this.closeSettingsModal();
            });
        }

        // Sound Toggle
        if (this.soundToggleBtn) {
            this.soundToggleBtn.addEventListener('click', () => {
                this.soundEnabled = !this.soundEnabled;
                this.soundToggleBtn.innerHTML = this.soundEnabled ? '🔊 Audio: ON' : '🔇 Audio: OFF';
                this.soundToggleBtn.classList.toggle('active', this.soundEnabled);
                if (this.soundEnabled) this.playHudSound('beep');
            });
        }

        // Global hotkey: '/' to focus search
        window.addEventListener('keydown', (e) => {
            if (e.key === '/' && document.activeElement !== this.queryInput && document.activeElement !== this.apiKeyInput) {
                e.preventDefault();
                this.switchTab('oracle');
                this.queryInput.focus();
                this.queryInput.select();
            }
            if (e.key === 'Escape') {
                this.closeModal();
                this.closeSettingsModal();
            }
        });
    }

    switchTab(tabId) {
        this.currentTab = tabId;
        this.tabButtons.forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
        this.tabContents.forEach(view => view.classList.toggle('active', view.id === `tab-${tabId}`));
    }

    async handleQuerySubmit() {
        const query = this.queryInput.value.trim();
        if (!query) return;

        this.playHudSound('scan');
        this.queryResultsContainer.innerHTML = `
            <div class="oracle-loading">
                <div class="reactor-pulse"></div>
                <p>J.A.R.V.I.S. is decrypting S.H.I.E.L.D. archives & comic matrices for: <strong>"${query}"</strong>...</p>
            </div>
        `;

        try {
            const result = await this.oracle.ask(query);
            this.renderOracleResult(result);
            this.playHudSound('beep');
        } catch (err) {
            this.queryResultsContainer.innerHTML = `
                <div class="oracle-card">
                    <div class="oracle-header">
                        <span class="badge badge-warning">Query Interrupted</span>
                        <h2>Archive Synchronization Error</h2>
                        <p>${err.message}</p>
                    </div>
                </div>
            `;
        }
    }

    renderOracleResult(result) {
        let warningHtml = result.warning ? `<div class="warning-banner">${result.warning}</div>` : '';
        this.queryResultsContainer.innerHTML = warningHtml + result.html;

        // Smoothly scroll results into view if needed
        this.queryResultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    renderAll() {
        this.renderMovies();
        this.renderStorylines();
        this.renderCharacters();
        this.renderComicRuns();
        this.updateApiStatusUI();
    }

    renderMovies() {
        if (!this.moviesGrid) return;

        let list = [...this.data.movies];

        // Filter
        if (this.moviePhaseFilter !== 'all') {
            list = list.filter(m => m.phase.toLowerCase().includes(this.moviePhaseFilter.toLowerCase()));
        }

        // Sort
        if (this.movieSort === 'chronological') {
            list.sort((a, b) => a.chronologicalOrder - b.chronologicalOrder);
        } else {
            list.sort((a, b) => a.releaseYear - b.releaseYear);
        }

        this.moviesGrid.innerHTML = list.map(m => `
            <div class="nexus-card movie-card" onclick="window.app.showMovieDetail('${m.id}')">
                <div class="card-glow-overlay"></div>
                <div class="card-top-meta">
                    <span class="badge badge-movie">${m.type.toUpperCase()}</span>
                    <span class="badge badge-dim">${m.phase}</span>
                </div>
                <h3 class="card-title">${m.title}</h3>
                <div class="card-details-row">
                    <span>📅 Rel: ${m.releaseYear}</span>
                    <span>⏱️ Timeline: ${m.chronologicalYear}</span>
                </div>
                <p class="card-synopsis-snippet">${m.synopsis.slice(0, 110)}...</p>
                <div class="card-bottom-bar">
                    <span class="villain-label">🦹 ${m.mainVillain}</span>
                    <button class="inspect-btn">Examine Dossier ➜</button>
                </div>
            </div>
        `).join('');
    }

    renderStorylines() {
        if (!this.storylinesGrid) return;

        this.storylinesGrid.innerHTML = this.data.storylines.map(s => `
            <div class="nexus-card storyline-card" onclick="window.app.showStorylineDetail('${s.id}')">
                <div class="card-glow-overlay"></div>
                <div class="card-top-meta">
                    <span class="badge badge-comic">📚 Comic Event</span>
                    <span class="badge badge-dim">${s.universe} (${s.year})</span>
                </div>
                <h3 class="card-title">${s.title}</h3>
                <p class="card-author">By <strong>${s.writer}</strong> & <strong>${s.artist}</strong></p>
                <p class="card-synopsis-snippet">${s.synopsis.slice(0, 110)}...</p>
                <div class="card-issues-preview">
                    <strong>Core Issues:</strong> <code>${s.coreIssues.slice(0, 45)}...</code>
                </div>
                <div class="card-bottom-bar">
                    <span class="tag-chip">${s.keyCharacters[0] || 'Marvel'}</span>
                    <button class="inspect-btn">Reading Guide ➜</button>
                </div>
            </div>
        `).join('');
    }

    renderCharacters() {
        if (!this.charactersGrid) return;

        this.charactersGrid.innerHTML = this.data.characters.map(c => `
            <div class="nexus-card character-card" onclick="window.app.showCharacterDetail('${c.id}')">
                <div class="card-glow-overlay"></div>
                <div class="card-top-meta">
                    <span class="badge badge-char">🦸 Codex</span>
                    <span class="badge badge-dim">${c.universe.split('&')[0]}</span>
                </div>
                <h3 class="card-title">${c.name}</h3>
                <h4 class="card-subtitle">${c.alias}</h4>
                <div class="char-first-app">1st App: <em>${c.firstAppearance}</em></div>
                <div class="char-mini-stats">
                    <span title="Strength">💪 STR: ${c.powerGrid.strength}/7</span>
                    <span title="Intelligence">🧠 INT: ${c.powerGrid.intelligence}/7</span>
                    <span title="Energy">⚡ ENG: ${c.powerGrid.energyProjection}/7</span>
                </div>
                <p class="card-synopsis-snippet">${c.comicBio.slice(0, 100)}...</p>
                <div class="card-bottom-bar">
                    <button class="inspect-btn">View Full Power Grid ➜</button>
                </div>
            </div>
        `).join('');
    }

    renderComicRuns() {
        if (!this.comicRunsGrid) return;

        this.comicRunsGrid.innerHTML = this.data.comicRuns.map(run => `
            <div class="nexus-card comic-run-card" onclick="window.app.showComicRunDetail('${run.id}')">
                <div class="card-glow-overlay"></div>
                <div class="card-top-meta">
                    <span class="badge badge-comic">Master Run</span>
                    <span class="badge badge-dim">${run.years}</span>
                </div>
                <h3 class="card-title">${run.title}</h3>
                <p class="card-author">By <strong>${run.writer}</strong> & <strong>${run.artists}</strong></p>
                <p class="card-synopsis-snippet">${run.overview}</p>
                <div class="card-bottom-bar">
                    <button class="inspect-btn">View Issue Checklist ➜</button>
                </div>
            </div>
        `).join('');
    }

    showMovieDetail(id) {
        const movie = this.data.movies.find(m => m.id === id);
        if (!movie) return;
        const res = this.oracle.buildMovieResponse(movie, "");
        this.openModal(res.html);
    }

    showStorylineDetail(id) {
        const story = this.data.storylines.find(s => s.id === id);
        if (!story) return;
        const res = this.oracle.buildStorylineResponse(story, "");
        this.openModal(res.html);
    }

    showCharacterDetail(id) {
        const char = this.data.characters.find(c => c.id === id);
        if (!char) return;
        const res = this.oracle.buildCharacterResponse(char, "");
        this.openModal(res.html);
    }

    showComicRunDetail(id) {
        const run = this.data.comicRuns.find(r => r.id === id);
        if (!run) return;
        const res = this.oracle.buildComicRunResponse(run);
        this.openModal(res.html);
    }

    openModal(html) {
        this.modalContent.innerHTML = html;
        this.modal.classList.add('active');
        this.playHudSound('scan');
    }

    closeModal() {
        this.modal.classList.remove('active');
    }

    openSettingsModal() {
        if (this.apiKeyInput) {
            this.apiKeyInput.value = this.oracle.getApiKey();
        }
        if (this.settingsModal) {
            this.settingsModal.classList.add('active');
        }
    }

    closeSettingsModal() {
        if (this.settingsModal) {
            this.settingsModal.classList.remove('active');
        }
    }

    updateApiStatusUI() {
        const hasKey = !!this.oracle.getApiKey();
        if (this.apiStatusText) {
            if (hasKey) {
                this.apiStatusText.innerHTML = `🟢 <strong>Live Gemini AI Active:</strong> Unlimited multiversal answers enabled.`;
            } else {
                this.apiStatusText.innerHTML = `🟡 <strong>Local S.H.I.E.L.D. Mode Active:</strong> High-speed built-in Marvel archives enabled. Optional: Add a free Google Gemini key for open-ended queries.`;
            }
        }
    }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
    window.app = new MarvelNexusApp();
});
