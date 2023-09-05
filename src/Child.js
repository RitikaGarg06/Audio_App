function Child({ concatenatedBase64 }) {
  return (
    <div>
      <h1>Concatenated Audio</h1>
      <div>
        <audio controls>
          <source
            src={`data:audio/mpeg;base64,${concatenatedBase64}`}
            type="audio/mpeg"
          />
          Your browser does not support the audio element.
        </audio>
      </div>
    </div>
  );
}
export default Child;
