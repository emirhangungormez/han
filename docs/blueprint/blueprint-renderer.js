/**
 * HAN Unreal Engine Blueprint Visualizer & Interactive Graph Engine
 * Parses raw Unreal Engine clipboard text and renders interactive visual Blueprint graphs.
 */

(function() {
    'use strict';

    // Pin category color definitions based on UE5 standards
    const PIN_TYPES = {
        'exec': { color: '#ffffff', wireClass: 'wire-exec', glyphClass: 'glyph-exec', label: 'Exec' },
        'bool': { color: '#dc2626', wireClass: 'wire-bool', glyphClass: 'glyph-bool', label: 'Boolean' },
        'boolean': { color: '#dc2626', wireClass: 'wire-bool', glyphClass: 'glyph-bool', label: 'Boolean' },
        'byte': { color: '#059669', wireClass: 'wire-byte', glyphClass: 'glyph-byte', label: 'Byte' },
        'enum': { color: '#059669', wireClass: 'wire-enum', glyphClass: 'glyph-enum', label: 'Enum' },
        'int': { color: '#06b6d4', wireClass: 'wire-int', glyphClass: 'glyph-int', label: 'Integer' },
        'int64': { color: '#06b6d4', wireClass: 'wire-int', glyphClass: 'glyph-int', label: 'Integer64' },
        'float': { color: '#34d399', wireClass: 'wire-float', glyphClass: 'glyph-float', label: 'Float' },
        'real': { color: '#34d399', wireClass: 'wire-real', glyphClass: 'glyph-real', label: 'Real' },
        'double': { color: '#34d399', wireClass: 'wire-float', glyphClass: 'glyph-float', label: 'Double' },
        'string': { color: '#e11d48', wireClass: 'wire-string', glyphClass: 'glyph-string', label: 'String' },
        'text': { color: '#f43f5e', wireClass: 'wire-text', glyphClass: 'glyph-text', label: 'Text' },
        'name': { color: '#c084fc', wireClass: 'wire-text', glyphClass: 'glyph-text', label: 'Name' },
        'vector': { color: '#facc15', wireClass: 'wire-vector', glyphClass: 'glyph-vector', label: 'Vector' },
        'rotator': { color: '#a855f7', wireClass: 'wire-rotator', glyphClass: 'glyph-rotator', label: 'Rotator' },
        'transform': { color: '#fb923c', wireClass: 'wire-transform', glyphClass: 'glyph-transform', label: 'Transform' },
        'object': { color: '#38bdf8', wireClass: 'wire-object', glyphClass: 'glyph-object', label: 'Object' },
        'actor': { color: '#38bdf8', wireClass: 'wire-actor', glyphClass: 'glyph-actor', label: 'Actor' },
        'class': { color: '#818cf8', wireClass: 'wire-class', glyphClass: 'glyph-class', label: 'Class' },
        'interface': { color: '#818cf8', wireClass: 'wire-interface', glyphClass: 'glyph-interface', label: 'Interface' },
        'struct': { color: '#64748b', wireClass: 'wire-struct', glyphClass: 'glyph-struct', label: 'Struct' },
        'delegate': { color: '#ef4444', wireClass: 'wire-delegate', glyphClass: 'glyph-delegate', label: 'Delegate' },
        'wildcard': { color: '#71717a', wireClass: 'wire-struct', glyphClass: 'glyph-struct', label: 'Wildcard' }
    };

    /**
     * Parse Unreal Engine text clipboard format into structured node graph
     */
    function parseUnrealBlueprintText(rawText) {
        if (!rawText || typeof rawText !== 'string') return { nodes: [], comments: [] };

        const nodes = [];
        const comments = [];
        const rawBlocks = rawText.split(/Begin Object /gi);

        rawBlocks.forEach(block => {
            if (!block.trim()) return;

            const fullBlock = 'Begin Object ' + block;
            const classMatch = block.match(/Class=([^\s]+)/i);
            const nameMatch = block.match(/Name="?([^"\s\r\n]+)"?/i);
            if (!classMatch) return;

            const className = classMatch[1].replace(/["']/g, '');
            const nodeName = nameMatch ? nameMatch[1] : ('Node_' + Math.random().toString(36).substr(2, 6));

            // Position
            const posXMatch = block.match(/NodePosX=(-?\d+)/i);
            const posYMatch = block.match(/NodePosY=(-?\d+)/i);
            const posX = posXMatch ? parseInt(posXMatch[1], 10) : 0;
            const posY = posYMatch ? parseInt(posYMatch[1], 10) : 0;

            // Comment Box
            if (className.includes('EdGraphNode_Comment')) {
                const commentMatch = block.match(/NodeComment="?([^"\r\n]+)"?/i);
                const widthMatch = block.match(/NodeWidth=(\d+)/i);
                const heightMatch = block.match(/NodeHeight=(\d+)/i);
                comments.push({
                    id: nodeName,
                    title: commentMatch ? commentMatch[1] : 'Comment',
                    x: posX,
                    y: posY,
                    width: widthMatch ? parseInt(widthMatch[1], 10) : 400,
                    height: heightMatch ? parseInt(heightMatch[1], 10) : 250
                });
                return;
            }

            // Node Title and classification
            let title = '';
            let subtitle = '';
            let category = 'function'; // event, function, pure, flow, macro, variable
            let icon = '⚡';

            if (className.includes('K2Node_Event')) {
                const eventMatch = block.match(/MemberName="?([^"\r\n]+)"?/i);
                title = eventMatch ? formatNodeName(eventMatch[1]) : 'Event';
                subtitle = 'Event';
                category = 'event';
                icon = '▶';
            } else if (className.includes('K2Node_CustomEvent')) {
                const customMatch = block.match(/CustomFunctionName="?([^"\r\n]+)"?/i);
                title = customMatch ? formatNodeName(customMatch[1]) : 'Custom Event';
                subtitle = 'Custom Event';
                category = 'event';
                icon = '★';
            } else if (className.includes('K2Node_IfThenElse')) {
                title = 'Branch';
                subtitle = 'Flow Control';
                category = 'flow';
                icon = '🔀';
            } else if (className.includes('K2Node_ExecutionSequence')) {
                title = 'Sequence';
                subtitle = 'Flow Control';
                category = 'flow';
                icon = '☰';
            } else if (className.includes('K2Node_CallFunction')) {
                const funcMatch = block.match(/MemberName="?([^"\r\n]+)"?/i);
                const isPureMatch = block.match(/bIsPureFunc=True/i);
                title = funcMatch ? formatNodeName(funcMatch[1]) : 'Call Function';
                if (isPureMatch) {
                    category = 'pure';
                    icon = 'ƒ';
                    subtitle = '';
                } else {
                    category = 'function';
                    icon = 'ƒ';
                    subtitle = '';
                }
            } else if (className.includes('K2Node_MacroInstance')) {
                const macroMatch = block.match(/MacroGraphReference=.*?MacroGraph=.*?:([^\s"',]+)/i);
                title = macroMatch ? formatNodeName(macroMatch[1]) : 'Macro';
                subtitle = 'Macro';
                category = 'macro';
                icon = 'Ⓜ';
            } else if (className.includes('K2Node_VariableGet')) {
                const varMatch = block.match(/VariableReference=.*?MemberName="?([^"\s\r\n]+)"?/i);
                title = varMatch ? varMatch[1] : 'Get Variable';
                category = 'pure';
                icon = '●';
            } else if (className.includes('K2Node_VariableSet')) {
                const varMatch = block.match(/VariableReference=.*?MemberName="?([^"\s\r\n]+)"?/i);
                title = varMatch ? ('Set ' + varMatch[1]) : 'Set Variable';
                category = 'variable';
                icon = '●';
            } else {
                const genericTitle = block.match(/NodeTitle="?([^"\r\n]+)"?/i);
                title = genericTitle ? genericTitle[1] : formatNodeName(className.split('.').pop().replace('K2Node_', ''));
            }

            // Pins parsing
            const pins = [];
            const pinRegex = /CustomProperties Pin \((.*?)\)/gi;
            let pinMatch;

            while ((pinMatch = pinRegex.exec(block)) !== null) {
                const pinStr = pinMatch[1];
                const pinIdMatch = pinStr.match(/PinId=([^\s,]+)/i);
                const pinNameMatch = pinStr.match(/PinName="?([^",]+)"?/i);
                const pinTypeMatch = pinStr.match(/PinCategory="?([^",]+)"?/i);
                const dirMatch = pinStr.match(/Direction="?([^",]+)"?/i);
                const defaultValMatch = pinStr.match(/DefaultValue="?([^",]+)"?/i);
                const linkedToMatch = pinStr.match(/LinkedTo=\((.*?)\)/i);

                const pinName = pinNameMatch ? pinNameMatch[1] : '';
                const isOutput = dirMatch && dirMatch[1].includes('Output');
                let pinCategory = pinTypeMatch ? pinTypeMatch[1].toLowerCase() : 'exec';

                if (pinName.toLowerCase() === 'execute' || pinName.toLowerCase() === 'then') {
                    pinCategory = 'exec';
                }

                const links = [];
                if (linkedToMatch) {
                    const linkSegments = linkedToMatch[1].split(',');
                    linkSegments.forEach(seg => {
                        const parts = seg.trim().split(' ');
                        if (parts.length >= 2) {
                            links.push({
                                targetNodeName: parts[0],
                                targetPinId: parts[1]
                            });
                        }
                    });
                }

                pins.push({
                    id: pinIdMatch ? pinIdMatch[1] : pinName,
                    name: formatPinName(pinName),
                    rawName: pinName,
                    isOutput: isOutput,
                    category: pinCategory,
                    defaultValue: defaultValMatch ? defaultValMatch[1] : null,
                    links: links
                });
            }

            nodes.push({
                id: nodeName,
                title: title,
                subtitle: subtitle,
                category: category,
                icon: icon,
                x: posX,
                y: posY,
                pins: pins
            });
        });

        return { nodes, comments };
    }

    function formatNodeName(str) {
        if (!str) return '';
        // Convert camelCase or PascalCase to readable text
        return str
            .replace(/^Receive/i, '')
            .replace(/^K2_/i, '')
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/_/g, ' ')
            .trim();
    }

    function formatPinName(name) {
        if (name === 'then' || name === 'execute') return '';
        if (name === 'self') return 'Self';
        return name;
    }

    /**
     * Blueprint Graph Visualizer Controller Class
     */
    class BlueprintGraphViewer {
        constructor(containerEl, blueprintText, title) {
            this.container = containerEl;
            this.rawText = (blueprintText || '').trim();
            this.title = title || 'Unreal Engine Blueprint';
            this.scale = 1;
            this.panX = 40;
            this.panY = 40;
            this.isDragging = false;
            this.dragStartX = 0;
            this.dragStartY = 0;
            this.data = parseUnrealBlueprintText(this.rawText);

            this.initDOM();
            this.renderGraph();
            this.bindEvents();
            this.centerView();
        }

        initDOM() {
            this.container.classList.add('ue-blueprint-container');
            this.container.innerHTML = `
                <div class="ue-bp-toolbar">
                    <div class="ue-bp-toolbar-title">
                        <span class="ue-bp-toolbar-badge">UE5</span>
                        <span>${escapeHTML(this.title)}</span>
                    </div>
                    <div class="ue-bp-toolbar-actions">
                        <button type="button" class="ue-bp-btn ue-bp-btn-primary btn-copy" title="Copy for Unreal Engine (Ctrl+V)">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                            <span>Copy Nodes</span>
                        </button>
                        <button type="button" class="ue-bp-btn btn-code-view" title="Toggle Code View">
                            <span>&lt;/&gt; Code</span>
                        </button>
                        <button type="button" class="ue-bp-btn btn-fullscreen" title="Fullscreen">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
                        </button>
                    </div>
                </div>

                <div class="ue-bp-viewport">
                    <div class="ue-bp-canvas">
                        <svg class="ue-bp-svg-layer"></svg>
                        <div class="ue-bp-nodes-layer"></div>
                    </div>

                    <div class="ue-bp-controls">
                        <button type="button" class="ue-bp-ctrl-btn btn-zoom-in" title="Zoom In">+</button>
                        <button type="button" class="ue-bp-ctrl-btn btn-zoom-out" title="Zoom Out">-</button>
                        <button type="button" class="ue-bp-ctrl-btn btn-fit" title="Reset View">⊙</button>
                    </div>

                    <div class="ue-bp-toast">✓ Copied! Paste directly into Unreal Engine (Ctrl+V)</div>
                </div>

                <div class="ue-bp-code-modal">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <strong style="color: #f4f4f5; font-size: 0.8rem;">Unreal Engine Clipboard Format</strong>
                        <button type="button" class="ue-bp-btn btn-close-code">Close</button>
                    </div>
                    <textarea class="ue-bp-code-textarea" readonly>${escapeHTML(this.rawText)}</textarea>
                </div>
            `;

            this.viewportEl = this.container.querySelector('.ue-bp-viewport');
            this.canvasEl = this.container.querySelector('.ue-bp-canvas');
            this.svgLayer = this.container.querySelector('.ue-bp-svg-layer');
            this.nodesLayer = this.container.querySelector('.ue-bp-nodes-layer');
            this.toastEl = this.container.querySelector('.ue-bp-toast');
            this.codeModalEl = this.container.querySelector('.ue-bp-code-modal');
        }

        renderGraph() {
            this.nodesLayer.innerHTML = '';
            this.svgLayer.innerHTML = '';

            // Render Comments
            this.data.comments.forEach(c => {
                const commentDiv = document.createElement('div');
                commentDiv.className = 'ue-bp-comment';
                commentDiv.style.left = `${c.x}px`;
                commentDiv.style.top = `${c.y}px`;
                commentDiv.style.width = `${c.width}px`;
                commentDiv.style.height = `${c.height}px`;
                commentDiv.innerHTML = `<div class="ue-bp-comment-header">${escapeHTML(c.title)}</div>`;
                this.nodesLayer.appendChild(commentDiv);
            });

            // Render Nodes
            this.data.nodes.forEach(node => {
                const nodeDiv = document.createElement('div');
                nodeDiv.className = `ue-bp-node node-${node.category}`;
                nodeDiv.id = `node-${node.id}`;
                nodeDiv.style.left = `${node.x}px`;
                nodeDiv.style.top = `${node.y}px`;

                const inPins = node.pins.filter(p => !p.isOutput);
                const outPins = node.pins.filter(p => p.isOutput);

                let inHtml = inPins.map(p => {
                    const info = PIN_TYPES[p.category] || PIN_TYPES.object;
                    const valHtml = p.defaultValue ? `<span class="ue-bp-pin-val">${escapeHTML(p.defaultValue)}</span>` : '';
                    return `
                        <div class="ue-bp-pin pin-in" data-pin-id="${p.id}" data-node-id="${node.id}" title="${info.label} (Input)">
                            <span class="ue-bp-pin-glyph ${info.glyphClass}"></span>
                            ${p.name ? `<span class="ue-bp-pin-name">${escapeHTML(p.name)}</span>` : ''}
                            ${valHtml}
                        </div>
                    `;
                }).join('');

                let outHtml = outPins.map(p => {
                    const info = PIN_TYPES[p.category] || PIN_TYPES.object;
                    return `
                        <div class="ue-bp-pin pin-out" data-pin-id="${p.id}" data-node-id="${node.id}" title="${info.label} (Output)">
                            <span class="ue-bp-pin-glyph ${info.glyphClass}"></span>
                            ${p.name ? `<span class="ue-bp-pin-name">${escapeHTML(p.name)}</span>` : ''}
                        </div>
                    `;
                }).join('');

                nodeDiv.innerHTML = `
                    <div class="ue-bp-node-header">
                        <span class="ue-bp-node-icon">${node.icon}</span>
                        <div class="ue-bp-node-title">
                            ${escapeHTML(node.title)}
                            ${node.subtitle ? `<span class="ue-bp-node-sub">${escapeHTML(node.subtitle)}</span>` : ''}
                        </div>
                    </div>
                    <div class="ue-bp-node-body">
                        <div class="ue-bp-pins-in">${inHtml}</div>
                        <div class="ue-bp-pins-out">${outHtml}</div>
                    </div>
                `;

                this.nodesLayer.appendChild(nodeDiv);
            });

            // Update Spline Wires on next frame
            requestAnimationFrame(() => this.drawWires());
        }

        drawWires() {
            this.svgLayer.innerHTML = '';

            this.data.nodes.forEach(sourceNode => {
                sourceNode.pins.forEach(pin => {
                    if (!pin.links || pin.links.length === 0) return;

                    pin.links.forEach(link => {
                        const srcPinEl = this.container.querySelector(`[data-node-id="${sourceNode.id}"][data-pin-id="${pin.id}"]`);
                        const tgtPinEl = this.container.querySelector(`[data-node-id="${link.targetNodeName}"][data-pin-id="${link.targetPinId}"]`);

                        if (!srcPinEl || !tgtPinEl) return;

                        const srcRect = srcPinEl.getBoundingClientRect();
                        const tgtRect = tgtPinEl.getBoundingClientRect();
                        const canvasRect = this.canvasEl.getBoundingClientRect();

                        // Pin Center coords relative to canvas
                        const x1 = (srcRect.left + (pin.isOutput ? srcRect.width - 4 : 4) - canvasRect.left) / this.scale;
                        const y1 = (srcRect.top + srcRect.height / 2 - canvasRect.top) / this.scale;
                        const x2 = (tgtPinEl.classList.contains('pin-out') ? tgtRect.left + tgtRect.width - 4 - canvasRect.left : tgtRect.left + 4 - canvasRect.left) / this.scale;
                        const y2 = (tgtRect.top + tgtRect.height / 2 - canvasRect.top) / this.scale;

                        const dx = Math.max(Math.abs(x2 - x1) * 0.5, 40);
                        const d = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

                        const info = PIN_TYPES[pin.category] || PIN_TYPES.exec;
                        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                        path.setAttribute('d', d);
                        path.setAttribute('class', `ue-bp-wire ${info.wireClass}`);
                        this.svgLayer.appendChild(path);
                    });
                });
            });
        }

        updateTransform() {
            this.canvasEl.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.scale})`;
            this.drawWires();
        }

        centerView() {
            if (this.data.nodes.length === 0) return;

            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            this.data.nodes.forEach(n => {
                minX = Math.min(minX, n.x);
                minY = Math.min(minY, n.y);
                maxX = Math.max(maxX, n.x + 220);
                maxY = Math.max(maxY, n.y + 150);
            });

            const vpRect = this.viewportEl.getBoundingClientRect();
            const graphWidth = maxX - minX || 300;
            const graphHeight = maxY - minY || 200;

            const scaleX = (vpRect.width - 80) / graphWidth;
            const scaleY = (vpRect.height - 80) / graphHeight;
            this.scale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.5), 1.1);

            this.panX = (vpRect.width - graphWidth * this.scale) / 2 - minX * this.scale;
            this.panY = (vpRect.height - graphHeight * this.scale) / 2 - minY * this.scale;

            this.updateTransform();
        }

        bindEvents() {
            // Drag & Pan
            this.viewportEl.addEventListener('mousedown', (e) => {
                if (e.target.closest('.ue-bp-controls') || e.target.closest('.ue-bp-code-modal')) return;
                this.isDragging = true;
                this.dragStartX = e.clientX - this.panX;
                this.dragStartY = e.clientY - this.panY;
            });

            window.addEventListener('mousemove', (e) => {
                if (!this.isDragging) return;
                this.panX = e.clientX - this.dragStartX;
                this.panY = e.clientY - this.dragStartY;
                this.updateTransform();
            });

            window.addEventListener('mouseup', () => {
                this.isDragging = false;
            });

            // Zoom on Scroll
            this.viewportEl.addEventListener('wheel', (e) => {
                e.preventDefault();
                const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
                const newScale = Math.min(Math.max(this.scale * zoomFactor, 0.3), 2.2);

                const vpRect = this.viewportEl.getBoundingClientRect();
                const mouseX = e.clientX - vpRect.left;
                const mouseY = e.clientY - vpRect.top;

                this.panX = mouseX - (mouseX - this.panX) * (newScale / this.scale);
                this.panY = mouseY - (mouseY - this.panY) * (newScale / this.scale);
                this.scale = newScale;

                this.updateTransform();
            }, { passive: false });

            // Controls buttons
            this.container.querySelector('.btn-zoom-in').addEventListener('click', () => {
                this.scale = Math.min(this.scale * 1.2, 2.2);
                this.updateTransform();
            });

            this.container.querySelector('.btn-zoom-out').addEventListener('click', () => {
                this.scale = Math.max(this.scale / 1.2, 0.3);
                this.updateTransform();
            });

            this.container.querySelector('.btn-fit').addEventListener('click', () => {
                this.centerView();
            });

            // Fullscreen
            const fsBtn = this.container.querySelector('.btn-fullscreen');
            fsBtn.addEventListener('click', () => {
                this.container.classList.toggle('fullscreen');
                setTimeout(() => this.centerView(), 50);
            });

            // Copy to Clipboard
            const copyBtn = this.container.querySelector('.btn-copy');
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(this.rawText).then(() => {
                    this.toastEl.classList.add('show');
                    setTimeout(() => this.toastEl.classList.remove('show'), 3000);
                });
            });

            // Code View Modal
            const codeBtn = this.container.querySelector('.btn-code-view');
            const closeCodeBtn = this.container.querySelector('.btn-close-code');
            codeBtn.addEventListener('click', () => this.codeModalEl.classList.toggle('open'));
            closeCodeBtn.addEventListener('click', () => this.codeModalEl.classList.remove('open'));
        }
    }

    function escapeHTML(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // Initialize all containers on page load
    function initAllBlueprintViewers() {
        document.querySelectorAll('[data-ue-blueprint]').forEach(el => {
            if (el._ueViewer) return;
            const scriptTag = el.querySelector('script[type="text/plain"]');
            const bpText = scriptTag ? scriptTag.textContent : (el.getAttribute('data-blueprint-text') || '');
            const title = el.getAttribute('data-title') || 'Blueprint Nodes';
            el._ueViewer = new BlueprintGraphViewer(el, bpText, title);
        });
    }

    // Expose global API
    window.HANBlueprint = {
        Viewer: BlueprintGraphViewer,
        parse: parseUnrealBlueprintText,
        init: initAllBlueprintViewers
    };

    document.addEventListener('DOMContentLoaded', initAllBlueprintViewers);
})();
