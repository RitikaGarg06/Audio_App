import axios from "axios";

export const textToAudioApi = async (data) => {
  try {
    const temp = {
      controlConfig: { dataTracking: true },
      input: [{ source: data }],
      config: { gender: "male", language: { sourceLanguage: "or" } },
    };

    const result = await axios.post("https://demo-api.models.ai4bharat.org/inference/tts",temp);
    // console.log(result);
    return result;
  } catch (e) {
    return e.message;
  }
};
