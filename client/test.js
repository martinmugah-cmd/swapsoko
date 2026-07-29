const expr = {isVoice ? (
  <A />
) : isImage ? (
  <B />
) : isProposal ? (
  <C />
) : (
  <div className="wrapper">
    {contentText.trim() && (
      contentText.startsWith("A") ? (
        <A />
      ) : contentText.startsWith("B") ? (
        <B />
      ) : (
        <div>
          {locationCoords ? (
            <Location />
          ) : (
            contentText
          )}
        </div>
      )
    )}
  </div>
)};
