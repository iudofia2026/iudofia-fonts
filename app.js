// Font Showcase App
class FontShowcase {
  constructor() {
    this.fonts = [];
    this.currentFont = null;
    this.currentVariant = null;
    this.settings = {
      size: 48,
      weight: 400,
      lineHeight: 1.4,
      letterSpacing: 0,
      italic: false,
      underline: false
    };
    this.theme = 'dark';
    this.view = 'single';

    this.init();
  }

  async init() {
    await this.loadFonts();
    this.populateFontSelect();
    this.setupEventListeners();
    this.setupSampleTexts();
    this.loadSettings();
    this.updatePreview();
  }

  async loadFonts() {
    try {
      const response = await fetch('fonts.json');
      this.fonts = await response.json();
      this.fonts = this.fonts.fonts || this.fonts;

      // Load all fonts using FontFace API
      for (const font of this.fonts) {
        for (const variant of font.variants) {
          try {
            const fontFace = new FontFace(
              font.family,
              `url(${variant.file})`,
              { weight: variant.weight, style: variant.style }
            );
            await fontFace.load();
            document.fonts.add(fontFace);
          } catch (e) {
            console.warn(`Failed to load ${font.family} variant:`, e);
          }
        }
      }
    } catch (e) {
      console.error('Failed to load fonts.json:', e);
    }
  }

  populateFontSelect() {
    const select = document.getElementById('fontSelect');
    select.innerHTML = '<option value="">Select a font...</option>';

    this.fonts.forEach(font => {
      const option = document.createElement('option');
      option.value = font.id;
      option.textContent = font.family;
      select.appendChild(option);
    });
  }

  setupEventListeners() {
    // Font select
    document.getElementById('fontSelect').addEventListener('change', (e) => {
      this.selectFont(e.target.value);
    });

    // Size slider
    document.getElementById('sizeSlider').addEventListener('input', (e) => {
      this.settings.size = parseInt(e.target.value);
      document.getElementById('sizeValue').textContent = this.settings.size;
      this.updatePreview();
    });

    // Weight slider
    document.getElementById('weightSlider').addEventListener('input', (e) => {
      this.settings.weight = parseInt(e.target.value);
      document.getElementById('weightValue').textContent = this.settings.weight;
      this.updatePreview();
    });

    // Line height slider
    document.getElementById('lineHeightSlider').addEventListener('input', (e) => {
      this.settings.lineHeight = parseFloat(e.target.value);
      document.getElementById('lineHeightValue').textContent = this.settings.lineHeight;
      this.updatePreview();
    });

    // Letter spacing slider
    document.getElementById('letterSpacingSlider').addEventListener('input', (e) => {
      this.settings.letterSpacing = parseFloat(e.target.value);
      document.getElementById('letterSpacingValue').textContent = this.settings.letterSpacing;
      this.updatePreview();
    });

    // Italic toggle
    document.getElementById('italicBtn').addEventListener('click', () => {
      this.settings.italic = !this.settings.italic;
      document.getElementById('italicBtn').classList.toggle('active', this.settings.italic);
      this.updatePreview();
    });

    // Underline toggle
    document.getElementById('underlineBtn').addEventListener('click', () => {
      this.settings.underline = !this.settings.underline;
      document.getElementById('underlineBtn').classList.toggle('active', this.settings.underline);
      this.updatePreview();
    });

    // Variant select
    document.getElementById('variantSelect').addEventListener('change', (e) => {
      const variantIndex = parseInt(e.target.value);
      if (this.currentFont && variantIndex >= 0) {
        this.currentVariant = this.currentFont.variants[variantIndex];
        // Update weight slider based on variant
        const weight = parseInt(this.currentVariant.weight);
        if (!isNaN(weight)) {
          this.settings.weight = weight;
          document.getElementById('weightSlider').value = weight;
          document.getElementById('weightValue').textContent = weight;
        }
        this.updatePreview();
      }
    });

    // Preview text input
    document.getElementById('previewText').addEventListener('input', (e) => {
      // Update is automatic, just store for later
    });

    // Search
    document.getElementById('searchInput').addEventListener('input', (e) => {
      this.filterFonts(e.target.value);
    });

    // View toggle
    document.getElementById('singleViewBtn').addEventListener('click', () => {
      this.setView('single');
    });

    document.getElementById('gridViewBtn').addEventListener('click', () => {
      this.setView('grid');
    });

    // Theme toggle
    document.getElementById('lightModeBtn').addEventListener('click', () => {
      this.setTheme('light');
    });

    document.getElementById('darkModeBtn').addEventListener('click', () => {
      this.setTheme('dark');
    });

    // Preset buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setSampleText(btn.dataset.preset);
      });
    });
  }

  setupSampleTexts() {
    this.sampleTexts = {
      alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
      pangram: 'The quick brown fox jumps over the lazy dog.',
      numbers: '0123456789',
      sentence: 'Pack my box with five dozen liquor jugs.',
      paragraph: `Typography is the art and technique of arranging type to make written language legible, readable, and appealing when displayed. The arrangement of type involves selecting typefaces, point sizes, line lengths, line-spacing (leading), and letter-spacing (tracking), and adjusting the space between pairs of letters (kerning).`,
      code: `function hello() {
  console.log("Hello, World!");
  return 42;
}`
    };
  }

  loadSettings() {
    // Load from localStorage if available
    const saved = localStorage.getItem('fontShowcaseSettings');
    if (saved) {
      const settings = JSON.parse(saved);
      Object.assign(this.settings, settings);

      // Update UI
      document.getElementById('sizeSlider').value = this.settings.size;
      document.getElementById('sizeValue').textContent = this.settings.size;
      document.getElementById('weightSlider').value = this.settings.weight;
      document.getElementById('weightValue').textContent = this.settings.weight;
      document.getElementById('lineHeightSlider').value = this.settings.lineHeight;
      document.getElementById('lineHeightValue').textContent = this.settings.lineHeight;
      document.getElementById('letterSpacingSlider').value = this.settings.letterSpacing;
      document.getElementById('letterSpacingValue').textContent = this.settings.letterSpacing;
      document.getElementById('italicBtn').classList.toggle('active', this.settings.italic);
      document.getElementById('underlineBtn').classList.toggle('active', this.settings.underline);
    }

    // Load theme
    const savedTheme = localStorage.getItem('fontShowcaseTheme');
    if (savedTheme) {
      this.setTheme(savedTheme);
    }
  }

  saveSettings() {
    localStorage.setItem('fontShowcaseSettings', JSON.stringify(this.settings));
  }

  selectFont(fontId) {
    this.currentFont = this.fonts.find(f => f.id === fontId);

    if (this.currentFont) {
      document.getElementById('fontName').textContent = this.currentFont.family;

      // Update variant dropdown
      const variantSelect = document.getElementById('variantSelect');
      variantSelect.innerHTML = '';

      // Group variants by weight/style
      const hasVariants = this.currentFont.variants.length > 1;

      if (hasVariants) {
        document.getElementById('variantGroup').style.display = 'flex';

        this.currentFont.variants.forEach((variant, index) => {
          const option = document.createElement('option');
          option.value = index;
          const styleLabel = variant.style === 'italic' ? 'Italic' : '';
          const variantLabel = variant.variant ? ` (${variant.variant})` : '';
          option.textContent = `Weight ${variant.weight}${styleLabel}${variantLabel}`;
          variantSelect.appendChild(option);
        });

        // Select first variant
        variantSelect.selectedIndex = 0;
        this.currentVariant = this.currentFont.variants[0];

        // Update font info
        const variableCount = this.currentFont.variants.filter(v => v.variable).length;
        document.getElementById('fontInfo').textContent =
          `${this.currentFont.variants.length} variants${variableCount > 0 ? ` (${variableCount} variable)` : ''}`;
      } else {
        document.getElementById('variantGroup').style.display = 'none';
        this.currentVariant = this.currentFont.variants[0];
        document.getElementById('fontInfo').textContent = '1 variant';
      }

      this.updatePreview();
    } else {
      document.getElementById('fontName').textContent = 'Select a font to preview';
      document.getElementById('fontInfo').textContent = '';
      document.getElementById('variantGroup').style.display = 'none';
    }
  }

  updatePreview() {
    const preview = document.getElementById('previewText');

    if (this.currentFont) {
      preview.style.fontFamily = `"${this.currentFont.family}", sans-serif`;
    }

    preview.style.fontSize = `${this.settings.size}px`;
    preview.style.fontWeight = this.settings.weight;
    preview.style.lineHeight = this.settings.lineHeight;
    preview.style.letterSpacing = `${this.settings.letterSpacing}px`;
    preview.style.fontStyle = this.settings.italic ? 'italic' : 'normal';
    preview.style.textDecoration = this.settings.underline ? 'underline' : 'none';

    this.saveSettings();
  }

  setSampleText(preset) {
    const text = this.sampleTexts[preset];
    if (text) {
      document.getElementById('previewText').value = text;
    }
  }

  filterFonts(query) {
    const grid = document.getElementById('fontGrid');
    const cards = grid.querySelectorAll('.font-card');
    const lowerQuery = query.toLowerCase();

    cards.forEach(card => {
      const name = card.dataset.name.toLowerCase();
      card.style.display = name.includes(lowerQuery) ? 'block' : 'none';
    });
  }

  setView(view) {
    this.view = view;

    document.getElementById('singleViewBtn').classList.toggle('active', view === 'single');
    document.getElementById('gridViewBtn').classList.toggle('active', view === 'grid');
    document.getElementById('singleView').classList.toggle('active', view === 'single');
    document.getElementById('gridView').classList.toggle('active', view === 'grid');

    if (view === 'grid') {
      this.renderGridView();
    }
  }

  setTheme(theme) {
    this.theme = theme;
    document.body.setAttribute('data-theme', theme);

    document.getElementById('lightModeBtn').classList.toggle('active', theme === 'light');
    document.getElementById('darkModeBtn').classList.toggle('active', theme === 'dark');

    localStorage.setItem('fontShowcaseTheme', theme);
  }

  renderGridView() {
    const grid = document.getElementById('fontGrid');
    grid.innerHTML = '';

    // Sort fonts alphabetically
    const sortedFonts = [...this.fonts].sort((a, b) => a.family.localeCompare(b.family));

    sortedFonts.forEach(font => {
      const card = document.createElement('div');
      card.className = 'font-card';
      card.dataset.name = font.family;

      const variantCount = font.variants.length;
      const hasVariable = font.variants.some(v => v.variable);

      card.innerHTML = `
        <div class="font-card-name">
          <span>${font.family}</span>
          <span class="font-card-variants">${variantCount}${hasVariable ? ' + var' : ''}</span>
        </div>
        <div class="font-card-preview" style="font-family: '${font.family}', sans-serif">
          ${this.sampleTexts.pangram}
        </div>
      `;

      card.addEventListener('click', () => {
        document.getElementById('fontSelect').value = font.id;
        this.selectFont(font.id);
        this.setView('single');
      });

      grid.appendChild(card);
    });
  }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  new FontShowcase();
});
