/**
 * HAN BlueprintUE Official Engine Integration & Auto-Initializer
 * Uses the official BlueprintUE render engine for 100% authentic Unreal Engine visual graph rendering.
 */

(function() {
    'use strict';

    function initBlueprintUE() {
        if (!window.blueprintUE || !window.blueprintUE.render || !window.blueprintUE.render.Main) {
            console.warn('BlueprintUE engine not yet loaded, retrying...');
            setTimeout(initBlueprintUE, 100);
            return;
        }

        document.querySelectorAll('[data-ue-blueprint]').forEach((wrapper, index) => {
            if (wrapper._bueInstance) return;

            const scriptTag = wrapper.querySelector('script[type="text/plain"]');
            const rawText = scriptTag ? scriptTag.textContent.trim() : (wrapper.getAttribute('data-blueprint-text') || '').trim();
            const title = wrapper.getAttribute('data-title') || 'Unreal Engine Blueprint';
            const height = wrapper.getAttribute('data-height') || '500px';

            wrapper.classList.add('bue-wrapper');
            wrapper.innerHTML = `
                <div class="bue-top-bar">
                    <div class="bue-title-wrap">
                        <span class="bue-pill">UE5</span>
                        <strong class="bue-title">${escapeHTML(title)}</strong>
                    </div>
                    <div class="bue-actions">
                        <button type="button" class="bue-copy-btn" title="Copy for Unreal Engine (Ctrl+V)">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                            <span>Copy Nodes (Ctrl+V)</span>
                        </button>
                    </div>
                </div>
                <div class="bue-target-canvas" style="width: 100%; height: ${height};"></div>
                <div class="bue-toast">✓ Copied to clipboard! Paste directly into Unreal Engine (Ctrl+V)</div>
            `;

            const targetCanvas = wrapper.querySelector('.bue-target-canvas');
            const copyBtn = wrapper.querySelector('.bue-copy-btn');
            const toast = wrapper.querySelector('.bue-toast');

            try {
                const instance = new window.blueprintUE.render.Main(rawText, targetCanvas, {
                    height: height
                });
                instance.start();
                wrapper._bueInstance = instance;
            } catch (err) {
                console.error('Error rendering BlueprintUE:', err);
                targetCanvas.innerHTML = `<div style="color: #ef4444; padding: 20px; font-family: monospace;">Failed to render Blueprint: ${err.message}</div>`;
            }

            // Copy to clipboard
            if (copyBtn) {
                copyBtn.addEventListener('click', () => {
                    navigator.clipboard.writeText(rawText).then(() => {
                        toast.classList.add('show');
                        setTimeout(() => toast.classList.remove('show'), 2500);
                    });
                });
            }
        });
    }

    function escapeHTML(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    window.HANBlueprintUE = {
        init: initBlueprintUE,
        renderTo: function(containerEl, rawBlueprintText, height = '500px') {
            if (!window.blueprintUE || !window.blueprintUE.render || !window.blueprintUE.render.Main) {
                console.error('BlueprintUE render engine is not ready');
                return null;
            }
            containerEl.innerHTML = '';
            const instance = new window.blueprintUE.render.Main(rawBlueprintText.trim(), containerEl, {
                height: height
            });
            instance.start();
            return instance;
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBlueprintUE);
    } else {
        initBlueprintUE();
    }
})();
