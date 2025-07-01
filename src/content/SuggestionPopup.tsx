// src/content/SuggestionPopup.tsx

export interface SuggestionPopupProps {
    top: number;
    left: number;
    // Make suggestedQuestion and suggestedAnswer optional
    suggestedQuestion?: string;
    suggestedAnswer?: string;
    onFill: () => void;
    onSaveNew: () => void;
    onClose: () => void;
  }
  
  export const SuggestionPopup: React.FC<SuggestionPopupProps> = ({
    top,
    left,
    suggestedQuestion,
    suggestedAnswer,
    onFill,
    onSaveNew,
    onClose,
  }) => {
    return (
      <div
        className="type-once-popup"
        style={{
          position: 'absolute',
          top: `${top}px`,
          left: `${left}px`,
          width: '320px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          backgroundColor: 'white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          padding: '16px',
          fontFamily: 'sans-serif',
          zIndex: 2147483647,
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{ position: 'absolute', top: '8px', right: '8px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px' }}
        >
          &times;
        </button>
        
        {/* Conditionally render the suggestion text and fill button */}
        {suggestedQuestion && suggestedAnswer ? (
          <>
            <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>
              This looks similar to '<strong>{suggestedQuestion}</strong>'.
            </p>
            <p style={{ marginTop: '8px', fontSize: '14px', color: '#555' }}>
              Fill with your saved answer: '<em>{suggestedAnswer}</em>'
            </p>
          </>
        ) : (
          <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>
            No similar entry found.
          </p>
        )}
  
        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
          {suggestedQuestion && (
            <button onClick={onFill} style={{ flex: 1, padding: '8px', border: '1px solid #007bff', backgroundColor: '#007bff', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>
              Fill with this Answer
            </button>
          )}
          <button onClick={onSaveNew} style={{ flex: 1, padding: '8px', border: '1px solid #ccc', backgroundColor: 'transparent', color: '#333', borderRadius: '4px', cursor: 'pointer' }}>
            Save as New Entry
          </button>
        </div>
      </div>
    );
  };
  