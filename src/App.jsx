import { useState, useEffect } from 'react';

const HEBREW_RE = /[֐-׿יִ-ﭏ]/g;
const LATIN_RE = /[a-zA-Z]/g;

function detectScript(text) {
  if (!text) return 'ltr';
  const hCount = (text.match(HEBREW_RE) || []).length;
  const lCount = (text.match(LATIN_RE) || []).length;
  return hCount > lCount ? 'rtl' : 'ltr';
}

function inputDir(direction, text) {
  if (direction === 'he2en') return 'rtl';
  if (direction === 'en2he') return 'ltr';
  return detectScript(text);
}

function outputDir(direction, translation) {
  if (direction === 'en2he') return 'rtl';
  if (direction === 'he2en') return 'ltr';
  return detectScript(translation);
}

export default function App() {
  const [password, setPassword] = useState(() => sessionStorage.getItem('ht_password') || '');
  const [text, setText] = useState('');
  const [translation, setTranslation] = useState('');
  const [direction, setDirection] = useState('auto');
  const [register, setRegister] = useState('auto');
  const [nikud, setNikud] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    sessionStorage.setItem('ht_password', password);
  }, [password]);

  const inDir = inputDir(direction, text);
  const outDir = outputDir(direction, translation);

  async function handleTranslate() {
    if (!text.trim() || !password) return;
    setLoading(true);
    setError('');
    setTranslation('');

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, direction, register, nikud, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Translation failed.');
      } else {
        setTranslation(data.translation);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(translation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTranslate();
    }
  }

  const canTranslate = !loading && text.trim().length > 0 && password.length > 0;

  return (
    <div className="app">
      <header className="header">
        <h1 className="title">
          <span lang="en">English</span>
          <span className="arrow">↔</span>
          <span lang="he" dir="rtl">עברית</span>
        </h1>
      </header>

      <div className="password-row">
        <input
          type="password"
          placeholder="App password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="password-input"
          autoComplete="current-password"
        />
      </div>

      <div className="controls">
        <label className="control-group">
          <span className="control-label">Direction</span>
          <select value={direction} onChange={(e) => setDirection(e.target.value)}>
            <option value="auto">Auto-detect</option>
            <option value="en2he">English → Hebrew</option>
            <option value="he2en">Hebrew → English</option>
          </select>
        </label>

        <label className="control-group">
          <span className="control-label">Register</span>
          <select value={register} onChange={(e) => setRegister(e.target.value)}>
            <option value="auto">Auto</option>
            <option value="formal">Formal</option>
            <option value="casual">Casual</option>
          </select>
        </label>

        <label className="control-group control-checkbox">
          <input
            type="checkbox"
            checked={nikud}
            onChange={(e) => setNikud(e.target.checked)}
          />
          <span>Show nikud</span>
        </label>
      </div>

      <div className="panels">
        <div className="panel">
          <textarea
            dir={inDir}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter text to translate…"
            maxLength={2000}
            className={`panel-textarea${inDir === 'rtl' ? ' hebrew' : ''}`}
            spellCheck={false}
          />
          <div className="panel-footer">
            <span className={`char-count${text.length > 1800 ? ' warn' : ''}`}>
              {text.length} / 2000
            </span>
            <button
              className="btn btn-primary"
              onClick={handleTranslate}
              disabled={!canTranslate}
            >
              {loading ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  Translating…
                </>
              ) : (
                'Translate'
              )}
            </button>
          </div>
        </div>

        <div className="panel">
          {error ? (
            <div className="panel-error">{error}</div>
          ) : (
            <div
              dir={outDir}
              className={`panel-result${!translation ? ' empty' : ''}${outDir === 'rtl' ? ' hebrew' : ''}`}
            >
              {translation || 'Translation will appear here…'}
            </div>
          )}
          <div className="panel-footer">
            {translation && !error && (
              <button className="btn btn-secondary" onClick={handleCopy}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            )}
          </div>
        </div>
      </div>

      <p className="hint">Enter to translate · Shift+Enter for new line</p>
    </div>
  );
}
