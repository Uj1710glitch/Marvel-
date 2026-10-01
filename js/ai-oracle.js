/**
 * Marvel Omniverse Nexus - AI Query Engine & Knowledge Oracle
 * Handles natural language questions about Marvel movies, storylines, characters, and comics.
 * Supports both high-speed offline encyclopedic synthesis and live Google Gemini AI mode.
 */

class MarvelOracle {
    constructor(marvelData) {
        this.data = marvelData;
        this.geminiApiKey = localStorage.getItem('marvel_gemini_api_key') || '';
    }

    setApiKey(key) {
        this.geminiApiKey = key ? key.trim() : '';
        if (this.geminiApiKey) {
            localStorage.setItem('marvel_gemini_api_key', this.geminiApiKey);
        } else {
            localStorage.removeItem('marvel_gemini_api_key');
        }
    }

    getApiKey() {
        return this.geminiApiKey;
    }

    /**
     * Master query handler: checks for live Gemini API if enabled/configured,
     * otherwise executes high-fidelity local semantic knowledge synthesis.
     */
    async ask(query) {
        const cleanQuery = query.trim();
        if (!cleanQuery) {
            return {
                title: "Protocol Void",
                type: "warning",
                html: "<p>Please enter a question or query regarding any Marvel movie, comic storyline, or character.</p>"
            };
        }

        // If user configured Gemini API key, query Google Gemini for unlimited depth
        if (this.geminiApiKey) {
            try {
                return await this.queryGemini(cleanQuery);
            } catch (err) {
                console.warn("Gemini API call failed, falling back to local archives:", err);
                const localResponse = this.queryLocalDatabase(cleanQuery);
                localResponse.warning = `⚠️ Note: Gemini API call failed (${err.message}). Displayed results from local S.H.I.E.L.D. archive.`;
                return localResponse;
            }
        }

        // Default: Instant, rich local semantic search & dossier synthesis
        return this.queryLocalDatabase(cleanQuery);
    }

    /**
     * Synthesizes comprehensive answers from the built-in Marvel knowledge base.
     */
    queryLocalDatabase(query) {
        const q = query.toLowerCase();

        // 1. Check for Timeline / Chronological Order queries
        if (q.includes("chronological") || q.includes("timeline") || (q.includes("order") && (q.includes("watch") || q.includes("movie")))) {
            return this.buildChronologicalTimelineResponse();
        }

        // 2. Check for Specific Storyline match
        const matchedStoryline = this.findStorylineMatch(q);
        if (matchedStoryline) {
            return this.buildStorylineResponse(matchedStoryline, q);
        }

        // 3. Check for Movie/Series match
        const matchedMovie = this.findMovieMatch(q);
        if (matchedMovie) {
            return this.buildMovieResponse(matchedMovie, q);
        }

        // 4. Check for Character match
        const matchedChar = this.findCharacterMatch(q);
        if (matchedChar) {
            return this.buildCharacterResponse(matchedChar, q);
        }

        // 5. Check for Comic Run match
        const matchedRun = this.findComicRunMatch(q);
        if (matchedRun) {
            return this.buildComicRunResponse(matchedRun);
        }

        // 6. Generic semantic multi-hit search across the entire database
        return this.buildBroadSearchResponse(q, query);
    }

    findStorylineMatch(q) {
        for (const story of this.data.storylines) {
            const titleLower = story.title.toLowerCase();
            const idLower = story.id.toLowerCase();
            if (q.includes(idLower) || q.includes(titleLower)) return story;
            if (story.tags && story.tags.some(t => q.includes(t.toLowerCase()))) return story;
            if (q.includes("secret wars") && story.id.includes("secret-wars")) return story;
            if (q.includes("infinity gauntlet") && story.id.includes("infinity-gauntlet")) return story;
            if (q.includes("civil war") && story.id.includes("civil-war")) return story;
            if (q.includes("house of m") && story.id.includes("house-of-m")) return story;
            if (q.includes("planet hulk") || q.includes("world war hulk")) {
                if (story.id.includes("planet-hulk")) return story;
            }
            if (q.includes("dark phoenix") && story.id.includes("dark-phoenix")) return story;
            if (q.includes("spider-verse") && story.id.includes("spider-verse")) return story;
            if (q.includes("annihilation") && story.id.includes("annihilation")) return story;
            if (q.includes("secret invasion") && story.id.includes("secret-invasion")) return story;
            if (q.includes("apocalypse") && story.id.includes("apocalypse")) return story;
        }
        return null;
    }

    findMovieMatch(q) {
        for (const movie of this.data.movies) {
            const titleLower = movie.title.toLowerCase();
            if (q.includes(titleLower)) return movie;
            if (movie.id && q.includes(movie.id.replace(/-/g, ' '))) return movie;
            if (q.includes("iron man 1") && movie.id === "iron-man-1") return movie;
            if (q.includes("first avenger") && movie.id === "captain-america-1") return movie;
            if (q.includes("winter soldier") && movie.id === "captain-america-winter-soldier") return movie;
            if (q.includes("infinity war") && movie.id === "avengers-infinity-war") return movie;
            if (q.includes("endgame") && movie.id === "avengers-endgame") return movie;
            if (q.includes("no way home") && movie.id === "spider-man-no-way-home") return movie;
            if (q.includes("multiverse of madness") && movie.id === "doctor-strange-multiverse-madness") return movie;
            if (q.includes("deadpool") && q.includes("wolverine") && movie.id === "deadpool-and-wolverine") return movie;
            if (q.includes("ragnarok") && movie.id === "thor-ragnarok") return movie;
            if (q.includes("black panther") && movie.id === "black-panther-1") return movie;
            if (q.includes("loki") && movie.id === "loki-series") return movie;
        }
        return null;
    }

    findCharacterMatch(q) {
        for (const char of this.data.characters) {
            const nameLower = char.name.toLowerCase();
            const aliasLower = char.alias.toLowerCase();
            if (q.includes(nameLower) || q.includes(aliasLower)) return char;
            if (char.id && q.includes(char.id)) return char;
            if (q.includes("spider man") || q.includes("spiderman") || q.includes("peter parker")) {
                if (char.id === "spider-man-peter") return char;
            }
            if (q.includes("gorr") || q.includes("god butcher")) {
                if (char.id === "gorr-the-god-butcher") return char;
            }
            if (q.includes("doom") || q.includes("victor von doom")) {
                if (char.id === "doctor-doom") return char;
            }
        }
        return null;
    }

    findComicRunMatch(q) {
        for (const run of this.data.comicRuns) {
            if (q.includes(run.writer.toLowerCase()) || q.includes(run.title.toLowerCase())) {
                return run;
            }
        }
        return null;
    }

    buildStorylineResponse(story, userQuery) {
        const isReadingOrderReq = userQuery.includes("reading order") || userQuery.includes("order") || userQuery.includes("issues");
        const isDiffReq = userQuery.includes("difference") || userQuery.includes("vs") || userQuery.includes("mcu");

        let html = `
            <div class="oracle-card">
                <div class="oracle-header">
                    <span class="badge badge-comic">📚 Iconic Comic Storyline</span>
                    <span class="badge badge-dim">${story.universe} (${story.year})</span>
                    <h2>${story.title}</h2>
                    <p class="oracle-credits">Written by <strong>${story.writer}</strong> | Art by <strong>${story.artist}</strong></p>
                </div>

                <div class="oracle-section">
                    <h3>⚡ The Prelude & Background</h3>
                    <p>${story.prelude}</p>
                </div>

                <div class="oracle-section">
                    <h3>📖 Full Event Synopsis</h3>
                    <p>${story.synopsis}</p>
                </div>

                <div class="oracle-section highlight-box">
                    <h3>🎯 Key Core Issues</h3>
                    <code>${story.coreIssues}</code>
                </div>

                <div class="oracle-section">
                    <h3>📚 Recommended Reading Order</h3>
                    <ol class="reading-order-list">
                        ${story.readingOrder.map(item => `<li><span class="step-badge">✓</span> ${item}</li>`).join('')}
                    </ol>
                </div>

                <div class="oracle-section">
                    <h3>💥 Cosmic Ramifications & Aftermath</h3>
                    <p>${story.consequences}</p>
                </div>

                <div class="oracle-section mcu-box">
                    <h3>🎬 Cinematic MCU Connection</h3>
                    <p>${story.mcuAdaptation}</p>
                </div>

                <div class="oracle-footer-tags">
                    <strong>Key Players:</strong> ${story.keyCharacters.map(c => `<span class="tag-chip">${c}</span>`).join(' ')}
                </div>
            </div>
        `;

        return {
            title: story.title,
            type: "storyline",
            html: html
        };
    }

    buildMovieResponse(movie, userQuery) {
        const isBoxOffice = userQuery.includes("box office") || userQuery.includes("money");
        const isPostCredits = userQuery.includes("post credit") || userQuery.includes("end credit");

        let html = `
            <div class="oracle-card">
                <div class="oracle-header">
                    <span class="badge badge-movie">🎬 ${movie.type.toUpperCase()}</span>
                    <span class="badge badge-dim">${movie.phase} • ${movie.saga}</span>
                    <h2>${movie.title} (${movie.releaseYear})</h2>
                    <p class="oracle-credits">Directed by <strong>${movie.director}</strong> | Runtime: <strong>${movie.duration}</strong> | Timeline: <strong>${movie.chronologicalYear}</strong></p>
                </div>

                <div class="oracle-section">
                    <h3>📜 Plot Synopsis</h3>
                    <p>${movie.synopsis}</p>
                </div>

                <div class="oracle-grid-two">
                    <div class="oracle-sub-box">
                        <h4>🦹 Primary Antagonist</h4>
                        <p>${movie.mainVillain}</p>
                    </div>
                    <div class="oracle-sub-box">
                        <h4>💰 Global Box Office</h4>
                        <p class="stat-large">${movie.boxOffice}</p>
                    </div>
                </div>

                <div class="oracle-section highlight-box">
                    <h3>📚 Comic Book Origins & Inspirations</h3>
                    <p>${movie.comicInspiration}</p>
                </div>

                <div class="oracle-section">
                    <h3>🎬 Post-Credit Scene & Teaser</h3>
                    <p><em>"${movie.postCredits}"</em></p>
                </div>

                <div class="oracle-section trivia-box">
                    <h3>💡 Production Lore & Trivia</h3>
                    <p>${movie.trivia}</p>
                </div>

                <div class="oracle-footer-tags">
                    <strong>Featured Heroes:</strong> ${movie.keyCharacters.map(c => `<span class="tag-chip">${c}</span>`).join(' ')}
                </div>
            </div>
        `;

        return {
            title: movie.title,
            type: "movie",
            html: html
        };
    }

    buildCharacterResponse(char, userQuery) {
        const stats = char.powerGrid;

        let html = `
            <div class="oracle-card">
                <div class="oracle-header">
                    <span class="badge badge-char">🦸 Character Codex</span>
                    <span class="badge badge-dim">${char.universe}</span>
                    <h2>${char.name} (${char.alias})</h2>
                    <p class="oracle-credits">First Appearance: <strong>${char.firstAppearance}</strong> | Created by: <strong>${char.creators}</strong></p>
                </div>

                <div class="oracle-grid-two">
                    <div>
                        <h3>⚡ Powers & Capabilities</h3>
                        <ul class="power-list">
                            ${char.powers.map(p => `<li>${p}</li>`).join('')}
                        </ul>
                    </div>
                    <div>
                        <h3>📊 Official Power Grid (1-7 Scale)</h3>
                        <div class="power-grid-bars">
                            ${this.renderPowerBar("Intelligence", stats.intelligence)}
                            ${this.renderPowerBar("Strength", stats.strength)}
                            ${this.renderPowerBar("Speed", stats.speed)}
                            ${this.renderPowerBar("Durability", stats.durability)}
                            ${this.renderPowerBar("Energy Projection", stats.energyProjection)}
                            ${this.renderPowerBar("Fighting Skills", stats.fightingSkills)}
                        </div>
                    </div>
                </div>

                <div class="oracle-section">
                    <h3>📖 Earth-616 Comic History</h3>
                    <p>${char.comicBio}</p>
                </div>

                <div class="oracle-section mcu-box">
                    <h3>🎬 Marvel Cinematic Universe (MCU) Portrayal</h3>
                    <p>${char.mcuBio}</p>
                </div>

                <div class="oracle-section highlight-box">
                    <h3>⚖️ Comic vs MCU Differences</h3>
                    <p>${char.comicVsMcuDiff}</p>
                </div>

                <div class="oracle-footer-tags">
                    <strong>Essential Storylines:</strong> ${char.majorStorylines.map(s => `<span class="tag-chip">${s}</span>`).join(' ')}
                </div>
            </div>
        `;

        return {
            title: `${char.name} (${char.alias})`,
            type: "character",
            html: html
        };
    }

    renderPowerBar(label, value) {
        const percent = Math.min(100, Math.round((value / 7) * 100));
        return `
            <div class="power-bar-row">
                <div class="power-label-wrapper">
                    <span class="power-name">${label}</span>
                    <span class="power-val">${value}/7</span>
                </div>
                <div class="power-track">
                    <div class="power-fill" style="width: ${percent}%;"></div>
                </div>
            </div>
        `;
    }

    buildChronologicalTimelineResponse() {
        // Sort movies by chronological order
        const sorted = [...this.data.movies].sort((a, b) => a.chronologicalOrder - b.chronologicalOrder);

        let html = `
            <div class="oracle-card">
                <div class="oracle-header">
                    <span class="badge badge-movie">⏱️ In-Universe Timeline</span>
                    <h2>MCU Chronological Viewing Order</h2>
                    <p>The definitive in-universe narrative timeline of the Marvel Cinematic Universe.</p>
                </div>

                <div class="timeline-container">
                    ${sorted.map((m, idx) => `
                        <div class="timeline-item">
                            <div class="timeline-marker">${idx + 1}</div>
                            <div class="timeline-content">
                                <span class="timeline-year">${m.chronologicalYear}</span>
                                <h4>${m.title}</h4>
                                <p class="timeline-meta">${m.phase} • Released ${m.releaseYear} • Directed by ${m.director}</p>
                                <p class="timeline-desc">${m.synopsis.slice(0, 140)}...</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        return {
            title: "MCU Chronological Timeline Order",
            type: "timeline",
            html: html
        };
    }

    buildComicRunResponse(run) {
        return {
            title: run.title,
            type: "comicRun",
            html: `
                <div class="oracle-card">
                    <div class="oracle-header">
                        <span class="badge badge-comic">📚 Master Comic Run</span>
                        <h2>${run.title} (${run.years})</h2>
                        <p class="oracle-credits">Written by <strong>${run.writer}</strong> | Illustrated by <strong>${run.artists}</strong></p>
                    </div>
                    <div class="oracle-section">
                        <h3>📖 Run Overview</h3>
                        <p>${run.overview}</p>
                    </div>
                    <div class="oracle-section highlight-box">
                        <h3>🎯 Key Issues to Collect & Read</h3>
                        <code>${run.mustReadIssues}</code>
                    </div>
                    <div class="oracle-section">
                        <h3>💡 Best For</h3>
                        <p>${run.bestFor}</p>
                    </div>
                </div>
            `
        };
    }

    buildBroadSearchResponse(q, rawQuery) {
        // Filter matches across movies, storylines, characters
        const matchedMovies = this.data.movies.filter(m => 
            m.title.toLowerCase().includes(q) || 
            m.synopsis.toLowerCase().includes(q) ||
            m.keyCharacters.some(c => c.toLowerCase().includes(q))
        );

        const matchedStories = this.data.storylines.filter(s => 
            s.title.toLowerCase().includes(q) || 
            s.synopsis.toLowerCase().includes(q) ||
            s.keyCharacters.some(c => c.toLowerCase().includes(q))
        );

        const matchedChars = this.data.characters.filter(c =>
            c.name.toLowerCase().includes(q) ||
            c.alias.toLowerCase().includes(q) ||
            c.comicBio.toLowerCase().includes(q)
        );

        if (matchedMovies.length === 0 && matchedStories.length === 0 && matchedChars.length === 0) {
            return {
                title: `Query Results for "${rawQuery}"`,
                type: "not_found",
                html: `
                    <div class="oracle-card">
                        <div class="oracle-header">
                            <span class="badge badge-warning">🔍 Archive Scan Result</span>
                            <h2>No Direct Match Found for "${rawQuery}"</h2>
                        </div>
                        <div class="oracle-section">
                            <p>S.H.I.E.L.D. local intelligence could not locate an exact match in the immediate local records for this query.</p>
                            <p><strong>Suggestions:</strong></p>
                            <ul>
                                <li>Try searching for famous names like <em>"Secret Wars"</em>, <em>"Iron Man"</em>, <em>"Civil War"</em>, <em>"Gorr"</em>, <em>"House of M"</em>, <em>"Infinity War"</em>.</li>
                                <li>Ask for <em>"MCU chronological order"</em> or <em>"reading order for Spider-Verse"</em>.</li>
                                <li>Connect a free <strong>Google Gemini API Key</strong> in the top-right settings to unlock live AI Q&A for literally every Marvel comic issue and alternate universe!</li>
                            </ul>
                        </div>
                    </div>
                `
            };
        }

        let html = `
            <div class="oracle-card">
                <div class="oracle-header">
                    <span class="badge badge-dim">Universal Search</span>
                    <h2>Results for "${rawQuery}"</h2>
                    <p>Found ${matchedMovies.length} movies/series, ${matchedStories.length} storylines, and ${matchedChars.length} character dossiers.</p>
                </div>
        `;

        if (matchedStories.length > 0) {
            html += `
                <div class="oracle-section">
                    <h3>📚 Matching Comic Storylines</h3>
                    <div class="search-hit-grid">
                        ${matchedStories.map(s => `
                            <div class="search-hit-card" onclick="window.app.showStorylineDetail('${s.id}')">
                                <h4>${s.title} (${s.year})</h4>
                                <p class="hit-meta">${s.writer} • ${s.universe}</p>
                                <p class="hit-snippet">${s.synopsis.slice(0, 120)}...</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        if (matchedMovies.length > 0) {
            html += `
                <div class="oracle-section">
                    <h3>🎬 Matching Movies & Series</h3>
                    <div class="search-hit-grid">
                        ${matchedMovies.map(m => `
                            <div class="search-hit-card" onclick="window.app.showMovieDetail('${m.id}')">
                                <h4>${m.title} (${m.releaseYear})</h4>
                                <p class="hit-meta">${m.phase} • Villain: ${m.mainVillain}</p>
                                <p class="hit-snippet">${m.synopsis.slice(0, 120)}...</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        if (matchedChars.length > 0) {
            html += `
                <div class="oracle-section">
                    <h3>🦸 Matching Characters</h3>
                    <div class="search-hit-grid">
                        ${matchedChars.map(c => `
                            <div class="search-hit-card" onclick="window.app.showCharacterDetail('${c.id}')">
                                <h4>${c.name} (${c.alias})</h4>
                                <p class="hit-meta">${c.universe} • 1st App: ${c.firstAppearance}</p>
                                <p class="hit-snippet">${c.comicBio.slice(0, 120)}...</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        html += `</div>`;

        return {
            title: `Search: ${rawQuery}`,
            type: "search",
            html: html
        };
    }

    /**
     * Live Google Gemini AI query integration for answering ANY open-ended question.
     */
    async queryGemini(question) {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`;

        const prompt = `You are J.A.R.V.I.S. / Cerebro, the ultimate Marvel scholar and archivist possessing complete encyclopedic knowledge of all Marvel comic books (Earth-616, Earth-1610, Earth-295, etc.), the Marvel Cinematic Universe (MCU), Sony Marvel movies, animated series, and graphic novels.

A user asks: "${question}"

Provide a comprehensive, authoritative, and well-structured answer formatted with HTML. Use:
- <h2> and <h3> for clear headers
- <p> for paragraphs
- <ul class="power-list"> or <ol class="reading-order-list"> for lists and reading orders
- <div class="highlight-box"> for key comic issue numbers, creator credits, or vital lore
- <div class="mcu-box"> for MCU vs Comic differences if applicable
- Include comic issue citations, publication years, universe designations (e.g. Earth-616), and reading orders when discussing storylines.
Do NOT wrap the output in markdown codeblocks (no \`\`\`html); return clean, valid HTML markup only.`;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 2048
                }
            })
        });

        if (!response.ok) {
            const errorJson = await response.json();
            throw new Error(errorJson.error?.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        const candidate = data.candidates?.[0];
        let contentText = candidate?.content?.parts?.[0]?.text || "<p>No response received from Cerebro AI.</p>";

        // Strip any markdown code fences if Gemini added them
        contentText = contentText.replace(/^```html\s*/i, '').replace(/```$/i, '').trim();

        return {
            title: `Cerebro AI Analysis: "${question}"`,
            type: "ai",
            html: `
                <div class="oracle-card">
                    <div class="oracle-header">
                        <span class="badge badge-ai">🤖 Live Gemini AI Neural Analysis</span>
                        <p class="oracle-credits">Answer synthesized using Google Gemini API & Marvel Omniverse Knowledge Matrix</p>
                    </div>
                    <div class="oracle-body ai-generated-content">
                        ${contentText}
                    </div>
                </div>
            `
        };
    }
}

// Export for global access
if (typeof window !== 'undefined') {
    window.MarvelOracle = MarvelOracle;
}
