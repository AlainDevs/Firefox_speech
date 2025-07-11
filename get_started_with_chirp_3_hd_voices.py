# -*- coding: utf-8 -*-
"""get_started_with_chirp_3_hd_voices.ipynb

Automatically generated by Colab.

Original file is located at
    https://colab.research.google.com/github/GoogleCloudPlatform/generative-ai/blob/main/audio/speech/getting-started/get_started_with_chirp_3_hd_voices.ipynb
"""

# Copyright 2025 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""# Get started with Chirp 3 HD voices using Text-to-Speech

<table align="left">
  <td style="text-align: center">
    <a href="https://colab.research.google.com/github/GoogleCloudPlatform/generative-ai/blob/main/audio/speech/getting-started/get_started_with_chirp_3_hd_voices.ipynb">
      <img width="32px" src="https://www.gstatic.com/pantheon/images/bigquery/welcome_page/colab-logo.svg" alt="Google Colaboratory logo"><br> Open in Colab
    </a>
  </td>
  <td style="text-align: center">
    <a href="https://console.cloud.google.com/vertex-ai/colab/import/https:%2F%2Fraw.githubusercontent.com%2FGoogleCloudPlatform%2Fgenerative-ai%2Fmain%2Faudio%2Fspeech%2Fgetting-started%2Fget_started_with_chirp_3_hd_voices.ipynb">
      <img width="32px" src="https://lh3.googleusercontent.com/JmcxdQi-qOpctIvWKgPtrzZdJJK-J3sWE1RsfjZNwshCFgE_9fULcNpuXYTilIR2hjwN" alt="Google Cloud Colab Enterprise logo"><br> Open in Colab Enterprise
    </a>
  </td>
  <td style="text-align: center">
    <a href="https://console.cloud.google.com/vertex-ai/workbench/deploy-notebook?download_url=https://raw.githubusercontent.com/GoogleCloudPlatform/generative-ai/main/audio/speech/getting-started/get_started_with_chirp_3_hd_voices.ipynb">
      <img src="https://www.gstatic.com/images/branding/gcpiconscolors/vertexai/v1/32px.svg" alt="Vertex AI logo"><br> Open in Vertex AI Workbench
    </a>
  </td>
  <td style="text-align: center">
    <a href="https://github.com/GoogleCloudPlatform/generative-ai/blob/main/audio/speech/getting-started/get_started_with_chirp_3_hd_voices.ipynb">
      <img width="32px" src="https://www.svgrepo.com/download/217753/github.svg" alt="GitHub logo"><br> View on GitHub
    </a>
  </td>
</table>

<div style="clear: both;"></div>

<b>Share to:</b>

<a href="https://www.linkedin.com/sharing/share-offsite/?url=https%3A//github.com/GoogleCloudPlatform/generative-ai/blob/main/audio/speech/getting-started/get_started_with_chirp_3_hd_voices.ipynb" target="_blank">
  <img width="20px" src="https://upload.wikimedia.org/wikipedia/commons/8/81/LinkedIn_icon.svg" alt="LinkedIn logo">
</a>

<a href="https://bsky.app/intent/compose?text=https%3A//github.com/GoogleCloudPlatform/generative-ai/blob/main/audio/speech/getting-started/get_started_with_chirp_3_hd_voices.ipynb" target="_blank">
  <img width="20px" src="https://upload.wikimedia.org/wikipedia/commons/7/7a/Bluesky_Logo.svg" alt="Bluesky logo">
</a>

<a href="https://twitter.com/intent/tweet?url=https%3A//github.com/GoogleCloudPlatform/generative-ai/blob/main/audio/speech/getting-started/get_started_with_chirp_3_hd_voices.ipynb" target="_blank">
  <img width="20px" src="https://upload.wikimedia.org/wikipedia/commons/5/5a/X_icon_2.svg" alt="X logo">
</a>

<a href="https://reddit.com/submit?url=https%3A//github.com/GoogleCloudPlatform/generative-ai/blob/main/audio/speech/getting-started/get_started_with_chirp_3_hd_voices.ipynb" target="_blank">
  <img width="20px" src="https://redditinc.com/hubfs/Reddit%20Inc/Brand/Reddit_Logo.png" alt="Reddit logo">
</a>

<a href="https://www.facebook.com/sharer/sharer.php?u=https%3A//github.com/GoogleCloudPlatform/generative-ai/blob/main/audio/speech/getting-started/get_started_with_chirp_3_hd_voices.ipynb" target="_blank">
  <img width="20px" src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg" alt="Facebook logo">
</a>

| Authors |
| --- |
| [Holt Skinner](https://github.com/holtskinner) |
| [Ivan Nardini](https://github.com/inardini) |

## Overview

This notebook introduces [Chirp 3 HD Voices](https://cloud.google.com/text-to-speech/docs/chirp3-hd), which are Google Cloud's latest advancement in Text-to-Speech (TTS) technology.

These voices, powered by state-of-the-art large language models (LLMs), offer a significantly improved level of realism and emotional expressiveness.

Chirp 3 HD voices provide high-fidelity audio and natural-sounding speech, complete with human-like intonation and pauses. They are available on the Vertex AI platform and are designed for various uses like, voice assistants, audiobooks, and customer service applications.

There are currently eight distinct voice options(4 male, 4 female) available in 31 languages.

In this tutorial, you learn how to:

- How to synthesize speech using real-time (online) processing
- How to synthesize speech using streaming processing

## Get started

### Install Text-to-Speech SDK and other required packages
"""

# Commented out IPython magic to ensure Python compatibility.
# %%bash
# # Detect the operating system
# os=$(uname -s)
# 
# if [[ "$os" == "Linux" ]]; then
#   # Linux installation
#   sudo apt update -y -qq
#   sudo apt install ffmpeg -y -qq
#   echo "ffmpeg installed successfully on Linux."
# elif [[ "$os" == "Darwin" ]]; then
#   # macOS installation
#   if command -v brew &> /dev/null; then
#     brew install ffmpeg
#     if [[ $? -eq 0 ]]; then
#         echo "ffmpeg installed successfully on macOS using Homebrew."
#     else
#         echo "Error installing ffmpeg on macOS using Homebrew."
#     fi
#   else
#     echo "Homebrew is not installed. Please install Homebrew and try again."
#   fi
# else
#   echo "Unsupported operating system: $os"
# fi

# Commented out IPython magic to ensure Python compatibility.
# %pip install --upgrade --quiet google-cloud-texttospeech

"""### Authenticate your notebook environment (Colab only)

If you're running this notebook on Google Colab, run the cell below to authenticate your environment.
"""

import sys

if "google.colab" in sys.modules:
    from google.colab import auth

    auth.authenticate_user()

"""### Set Google Cloud project information and initialize SDK

To get started using the Text-to-Speech API, you must have an existing Google Cloud project and [enable the API](https://console.cloud.google.com/flows/enableapi?apiid=texttospeech.googleapis.com).

Learn more about [setting up a project and a development environment](https://cloud.google.com/vertex-ai/docs/start/cloud-environment).

Please note the **available regions** for Chirp 3, see [documentation](https://cloud.google.com/text-to-speech/docs/endpoints).
"""

# Use the environment variable if the user doesn't provide Project ID.
import os

PROJECT_ID = "[your-project-id]"  # @param {type: "string", placeholder: "[your-project-id]", isTemplate: true}
if not PROJECT_ID or PROJECT_ID == "[your-project-id]":
    PROJECT_ID = str(os.environ.get("GOOGLE_CLOUD_PROJECT"))

TTS_LOCATION = "global"

! gcloud config set project {PROJECT_ID}
! gcloud auth application-default set-quota-project {PROJECT_ID}
! gcloud auth application-default login -q

"""### Import libraries"""

from collections.abc import Iterator
import re

from IPython.display import Audio, display
from google.api_core.client_options import ClientOptions
from google.cloud import texttospeech_v1beta1 as texttospeech
import numpy as np

"""### Set constants

Initiate the API endpoint and the text to speech client.

"""

API_ENDPOINT = (
    f"{TTS_LOCATION}-texttospeech.googleapis.com"
    if TTS_LOCATION != "global"
    else "texttospeech.googleapis.com"
)

client = texttospeech.TextToSpeechClient(
    client_options=ClientOptions(api_endpoint=API_ENDPOINT)
)

"""### Helpers"""

def text_generator(text: str) -> Iterator[str]:
    """Split text into sentences to simulate streaming"""

    # Use regex with positive lookahead to find sentence boundaries
    # without consuming the space after the punctuation
    sentences: list[str] = re.findall(r"[^.!?]+[.!?](?:\s|$)", text + " ")

    # Yield each complete sentence
    for sentence in sentences:
        yield sentence.strip()

    # Check if there's remaining text not caught by the regex
    # (text without ending punctuation)
    last_char_pos: int = 0
    for sentence in sentences:
        last_char_pos += len(sentence)

    if last_char_pos < len(text.strip()):
        remaining: str = text.strip()[last_char_pos:]
        if remaining:
            yield remaining.strip()


def process_streaming_audio(
    text: str,
    voice: texttospeech.VoiceSelectionParams,
    display_individual_chunks: bool = False,
) -> np.ndarray:
    """Process text into speech using streaming TTS"""

    # Generate sentences from text
    sentences: list[str] = list(text_generator(text))

    # Get streaming audio
    print("Streaming audio processing...")
    audio_iterator: Iterator[bytes] = synthesize_streaming(iter(sentences), voice=voice)

    # Process audio chunks
    final_audio_data: np.ndarray = np.array([], dtype=np.int16)

    for idx, audio_content in enumerate(audio_iterator):
        audio_chunk: np.ndarray = np.frombuffer(audio_content, dtype=np.int16)

        # Concatenate to final audio
        final_audio_data = np.concatenate((final_audio_data, audio_chunk))

        # Optionally display individual chunks
        if display_individual_chunks and len(audio_chunk) > 0:
            print(f"Processed chunk # {idx}")
            display(Audio(audio_chunk, rate=24000))

    print("Streaming audio processing complete!")
    return final_audio_data


def synthesize_streaming(
    text_iterator: Iterator[str],
    voice: texttospeech.VoiceSelectionParams,
) -> Iterator[bytes]:
    """Synthesizes speech from an iterator of text inputs and yields audio content as an iterator.

    This function demonstrates how to use the Google Cloud Text-to-Speech API
    to synthesize speech from a stream of text inputs provided by an iterator.
    It yields the audio content from each response as an iterator of bytes.

    """

    config_request = texttospeech.StreamingSynthesizeRequest(
        streaming_config=texttospeech.StreamingSynthesizeConfig(
            voice=voice,
        )
    )

    def request_generator() -> Iterator[texttospeech.StreamingSynthesizeRequest]:
        yield config_request
        for text in text_iterator:
            yield texttospeech.StreamingSynthesizeRequest(
                input=texttospeech.StreamingSynthesisInput(text=text)
            )

    streaming_responses: Iterator[texttospeech.StreamingSynthesizeResponse] = (
        client.streaming_synthesize(request_generator())
    )

    for response in streaming_responses:
        yield response.audio_content

"""## Synthesize using Chirp 3 HD voices

### Synthesize speech using real-time (online) processing

You define the text you want to convert, select a specific voice and language, and then instruct the API to generate an audio of the spoken text.

This example uses the `en-US-Chirp3-HD-Aoede` voice, which is a high-definition voice, offering improved clarity. The code will call the `synthesize_speech` method, which handles the core conversion process, and the output will be an MP3 audio as `bytes`.
"""

prompt = "Hello world! I am Chirp 3"  # @param ["Hallo Welt! Ich bin Chirp 3", "Hello world! I am Chirp 3", "¡Hola mundo! Soy Chirp 3", "Bonjour le monde ! Je suis Chirp 3", "नमस्ते दुनिया! मैं चिर्प 3 हूं", "Olá Mundo! Eu sou o Chirp 3", "مرحبا بالعالم! أنا تشيرب 3", "¡Hola mundo! Soy Chirp 3", "Bonjour le monde ! Je suis Chirp 3", "Halo dunia! Saya Chirp 3", "Ciao mondo! Sono Chirp 3", "こんにちは世界！私はチャープ3です", "Merhaba dünya! Ben Chirp 3", "Chào thế giới! Tôi là Chirp 3", "হ্যালো ওয়ার্ল্ড! আমি চির্প 3", "હેલો વર્લ્ડ! હું ચિર્પ 3 છું", "ನಮಸ್ಕಾರ ಪ್ರಪಂಚ! ನಾನು ಚಿರ್ಪ್ 3", "ഹലോ വേൾഡ്! ഞാൻ ചിർപ് 3 ആണ്", "नमस्कार जग! मी चिरप 3 आहे", "வணக்கம் உலகம்! நான் சிர்ப் 3", "హలో వరల్డ్! నేను చిర్ప్ 3", "Hallo wereld! Ik ben Chirp 3", "안녕하세요! 저는 Chirp 3입니다", "你好世界！我是 Chirp 3", "Witaj świecie! Jestem Chirp 3", "Привет, мир! Я Чирп 3", "สวัสดีชาวโลก! ฉันคือเชิร์ป 3"]

voice = "Aoede"  # @param ["Aoede", "Puck", "Charon", "Kore", "Fenrir", "Leda", "Orus", "Zephyr"]

language_code = "en-US"  # @param [ "de-DE", "en-AU", "en-GB", "en-IN", "en-US", "fr-FR", "hi-IN", "pt-BR", "ar-XA", "es-ES", "fr-CA", "id-ID", "it-IT", "ja-JP", "tr-TR", "vi-VN", "bn-IN", "gu-IN", "kn-IN", "ml-IN", "mr-IN", "ta-IN", "te-IN", "nl-NL", "ko-KR", "cmn-CN", "pl-PL", "ru-RU", "th-TH"]

voice_name = f"{language_code}-Chirp3-HD-{voice}"
voice = texttospeech.VoiceSelectionParams(
    name=voice_name,
    language_code=language_code,
)

# Perform the text-to-speech request on the text input with the selected
# voice parameters and audio file type
response = client.synthesize_speech(
    input=texttospeech.SynthesisInput(text=prompt),
    voice=voice,
    # Select the type of audio file you want returned
    audio_config=texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3
    ),
)

"""Play the generated audio."""

display(Audio(response.audio_content))

"""### Synthesize speech using streaming processing

Chirp 3 HD voices also support streaming text-to-speech conversion using the `streaming_synthesize` method.  Unlike the standard `synthesize_speech`, which handles single requests, `streaming_synthesize` processes continuous streams of text, generating corresponding audio streams.

"""

prompt = """
Google Cloud Text-to-Speech (TTS) is a powerful API that converts text into natural-sounding audio. Here's a breakdown:

**Key Features:**

* **High-Fidelity Speech:** Leverages advanced AI to generate speech that closely resembles human voices.
* **Wide Voice Selection:** Offers a vast library of over 380 voices across 50+ languages and variants, catering to diverse needs.
* **Customization Options:**
    * **Custom Voice:** Create unique voices tailored to your brand or specific requirements using your own audio recordings.
    * **SSML Support:** Utilize Speech Synthesis Markup Language (SSML) to control pronunciation, pacing, and other speech nuances.
* **Integration Flexibility:** Easily integrate with various applications and devices via REST or gRPC APIs.
* **Use Cases:**
    * **Voice Assistants:** Powering conversational AI in smart devices, chatbots, and voice-activated applications.
    * **Accessibility:** Enabling screen readers and text-to-speech features for users with disabilities.
    * **E-learning:** Creating engaging and accessible educational content.
    * **Audiobooks and Podcasts:** Producing high-quality audio for audiobooks, podcasts, and other audio content.
    * **Interactive Experiences:** Enhancing user experiences in games, virtual reality, and other interactive applications.

**In essence, Google Cloud Text-to-Speech empowers developers and businesses to:**

* **Enhance user experiences:** Create more engaging and inclusive interactions through natural-sounding speech.
* **Increase accessibility:** Make information more accessible to a wider audience, including those with visual impairments.
* **Improve efficiency:** Automate tasks like reading aloud documents, generating voiceovers, and creating interactive voice responses.
* **Innovate with new applications:** Explore novel use cases by leveraging the power of AI-powered speech synthesis.

If you're looking to add a voice dimension to your applications or projects, Google Cloud Text-to-Speech is a valuable tool to consider.
"""
final_audio_data = process_streaming_audio(
    prompt, voice, display_individual_chunks=False
)

display(Audio(final_audio_data, rate=24000))