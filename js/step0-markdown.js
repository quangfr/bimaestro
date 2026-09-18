// =========================================================================
// Maestro BI - js/step0-markdown.js
// Étape 0 : Lecteur Markdown & Modale Gouvernance
// =========================================================================

    let methodologyLoaded = false;

    function openMethodologyModal(stepNum) {
      const modal = document.getElementById("methodology-modal");
      if (!modal) return;
      modal.classList.remove("hidden");

      const container = document.getElementById("methodology-modal-content");
      if (!methodologyLoaded && container) {
        if (typeof marked === 'undefined') {
          ensureMarked(() => openMethodologyModal(stepNum));
          return;
        }
        fetch('gouvernance.md')
          .then(res => {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.text();
          })
          .then(md => {
            container.innerHTML = marked.parse(md);
            attachCopyButtonsToPre(container);
            methodologyLoaded = true;
            if (stepNum) {
              setTimeout(() => scrollToMethodology(stepNum), 80);
            }
          })
          .catch(err => {
            container.innerHTML = `<p class="text-red-600 font-bold p-4">❌ Impossible de charger gouvernance.md : ${err.message}</p>`;
          });
      } else if (stepNum) {
        setTimeout(() => scrollToMethodology(stepNum), 60);
      }

      if (window.lucide && window.lucide.createIcons) {
        window.lucide.createIcons();
      }
    }

    function closeMethodologyModal() {
      const modal = document.getElementById("methodology-modal");
      if (modal) modal.classList.add("hidden");
    }

    function scrollToMethodology(stepNum) {
      const modalContent = document.getElementById("methodology-modal-content");
      const target = document.getElementById("methodology-step-" + stepNum);
      if (target && modalContent) {
        const topPos = target.offsetTop - modalContent.offsetTop - 12;
        modalContent.scrollTo({ top: Math.max(0, topPos), behavior: "smooth" });
        const heading = target.closest('h2') || target.nextElementSibling || target;
        heading.classList.add("ring-2", "ring-blue-500", "rounded-md");
        setTimeout(() => heading.classList.remove("ring-2", "ring-blue-500", "rounded-md"), 1800);
      }
    }


    // --- Page 0 : Lecteur des fichiers Markdown du dossier racine (chargement à la volée) ---
    const ROOT_MD_FILES = ['readme.md', 'content.md', 'gouvernance.md', 'AGENTS.md', 'data.json'];

    function initMarkdownViewer() {
      const sel = document.getElementById('md-file-select');
      const container = document.getElementById('md-render');
      if (!sel || !container) return;
      ROOT_MD_FILES.forEach((f) => {
        const opt = document.createElement('option');
        opt.value = f;
        opt.textContent = f;
        sel.appendChild(opt);
      });
      sel.value = 'readme.md';
      loadMarkdownFile('readme.md');
    }

    function ensureMarked(cb) {
      if (typeof marked !== 'undefined') return cb();
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/marked/12.0.2/marked.min.js';
      s.onload = cb;
      s.onerror = () => {
        const container = document.getElementById('md-render');
        if (container) container.innerHTML = '<p class="text-red-600 font-bold">⚠️ marked.js introuvable (CDN bloqué).</p>';
      };
      document.head.appendChild(s);
    }

    function loadMarkdownFile(file) {
      const container = document.getElementById('md-render');
      if (!container) return;
      if (typeof marked === 'undefined') {
        ensureMarked(() => loadMarkdownFile(file));
        return;
      }
      container.innerHTML = '<p class="text-slate-400 italic">⏳ Chargement de <code>' + file + '</code>…</p>';
      fetch(file)
        .then((res) => {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.text();
        })
        .then((text) => {
          if (/\.json$/i.test(file)) {
            try {
              const pretty = JSON.stringify(JSON.parse(text), null, 2);
              const pre = document.createElement('pre');
              pre.style.cssText = 'max-height:78vh;overflow:auto;font-size:12.5px;line-height:1.55;background:#ffffff;color:#000000;border:1px solid #cbd5e1;border-radius:8px;padding:12px;font-weight:500;';
              const code = document.createElement('code');
              code.style.cssText = 'color:#000000;background:transparent;padding:0;border:none;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12.5px;';
              code.textContent = pretty;
              pre.appendChild(code);
              container.innerHTML = '';
              container.appendChild(pre);
              return;
            } catch (e) { /* fallback: on affiche le texte brut */ }
          }
          container.innerHTML = marked.parse(text);
          attachCopyButtonsToPre(container);
        })
        .catch((err) => {
          container.innerHTML =
            '<p class="text-red-600 font-bold">❌ Impossible de charger <code>' + file + '</code> : ' + err.message + '</p>' +
            '<p class="text-slate-500 text-[10.5px]">Astuce : servir la page via un serveur HTTP (VS Code Live Server, GitHub Pages ou Firebase Hosting).</p>';
        });
    }

    function attachCopyButtonsToPre(root) {
      if (!root) return;
      const pres = root.querySelectorAll('pre');
      pres.forEach((pre) => {
        if (pre.dataset.hasCopyBtn) return;
        pre.dataset.hasCopyBtn = 'true';
        pre.classList.add('relative', 'group');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.title = 'Copier le code';
        btn.textContent = '⧉';
        btn.className = 'absolute top-1.5 right-1.5 px-2 py-0.5 text-xs rounded bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-600/60 opacity-80 group-hover:opacity-100 transition-opacity font-mono cursor-pointer shadow-sm';
        btn.onclick = (e) => {
          e.stopPropagation();
          e.preventDefault();
          const codeEl = pre.querySelector('code') || pre;
          const textToCopy = codeEl.innerText || codeEl.textContent || '';
          copyTextToClipboard(textToCopy).then(() => {
            const orig = btn.textContent;
            btn.textContent = '✓ Copié';
            btn.classList.add('text-emerald-400');
            setTimeout(() => {
              btn.textContent = orig;
              btn.classList.remove('text-emerald-400');
            }, 1500);
          });
        };
        pre.appendChild(btn);
      });
    }