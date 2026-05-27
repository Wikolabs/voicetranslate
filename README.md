# voicetranslate — Real-Time Multilingual Speech Transcription & Translation

> Wikolabs AI Platform · GCP Cloud Run GPU · Next.js 14 + FastAPI · Whisper large-v3 + NLLB-200

---

## Table of Contents

1. [Vision produit](#1-vision-produit)
2. [User Stories](#2-user-stories)
3. [Business Rules](#3-business-rules)
4. [Architecture Overview](#4-architecture-overview)
5. [Mono-repo Structure](#5-mono-repo-structure)
6. [WebRTC & Audio Pipeline Specification](#6-webrtc--audio-pipeline-specification)
7. [UML Diagrams](#7-uml-diagrams)
8. [API Reference](#8-api-reference)
9. [UI Simulation Guide](#9-ui-simulation-guide)
10. [Database Schema](#10-database-schema)
11. [Infrastructure & Deployment](#11-infrastructure--deployment)
12. [CI/CD Pipeline](#12-cicd-pipeline)
13. [Kaggle Dataset](#13-kaggle-dataset)
14. [Local Development](#14-local-development)

---

## 1. Vision produit

### Problème métier

La barrière de la langue coûte cher aux entreprises :

- Les réunions internationales sans transcription ni traduction en temps réel génèrent des erreurs de compréhension critiques
- Les podcasts et contenus audio en langue étrangère touchent une audience réduite faute de sous-titres
- Le support client multilingue nécessite des équipes de traducteurs coûteuses
- Les documents audio (enregistrements clients, interviews, audits) restent inexploitables sans transcription

Les solutions existantes (Google Speech-to-Text, AWS Transcribe) sont coûteuses à l'usage et ne permettent pas le contrôle de la confidentialité des données.

### Solution

**voicetranslate** offre une transcription audio multilingue en temps réel couplée à une traduction neuronale. L'utilisateur enregistre directement depuis le navigateur via WebRTC, le flux est traité par Whisper large-v3 (99 langues) et traduit par NLLB-200 (200 langues), avec export en SRT, VTT ou JSON horodaté.

### Proposition de valeur

| Approche actuelle | voicetranslate |
|---|---|
| API cloud coûteuse à la minute | Infrastructure GPU propre, coût maîtrisé |
| Données audio envoyées à des tiers | Audio supprimé après traitement, zéro stockage |
| Interface spécialisée, intégration difficile | API REST + WebSocket, intégrable en 1 heure |
| Support 10-20 langues | Whisper : 99 langues, NLLB : 200 langues |
| Transcription sans traduction | Transcription + traduction en un seul pipeline |

### Cas d'usage cibles

- **Réunions d'entreprise** : transcription automatique + traduction pour équipes internationales
- **Podcasts & médias** : sous-titres SRT/VTT multilingues en quelques minutes
- **Support client** : agents non-natifs assistés par transcription et traduction live
- **Recherche & études** : transcription d'interviews, focus groups, entretiens
- **Accessibilité** : sous-titres temps réel pour malentendants

---

## 2. User Stories

### Rôles

- **Utilisateur standard** : enregistre et transcrit depuis le navigateur
- **Opérateur** : upload de fichiers audio en batch
- **Développeur** : intègre l'API dans une application tierce
- **Administrateur** : gère les quotas et les sessions

### Epic 1 — Transcription temps réel

| ID | En tant que | Je veux | Afin de |
|---|---|---|---|
| US-001 | Utilisateur | cliquer sur un bouton pour enregistrer depuis mon micro | démarrer la transcription sans configuration |
| US-002 | Utilisateur | voir le texte transcrit apparaître mot par mot en temps réel | suivre la transcription pendant l'enregistrement |
| US-003 | Utilisateur | choisir la langue source ou laisser la détection automatique | adapter à n'importe quel locuteur |
| US-004 | Utilisateur | voir les mots incertains signalés comme unclear | identifier les passages à vérifier manuellement |

### Epic 2 — Traduction

| ID | En tant que | Je veux | Afin de |
|---|---|---|---|
| US-005 | Utilisateur | sélectionner une langue cible de traduction | obtenir une traduction immédiate |
| US-006 | Développeur | déclencher la traduction NLLB-200 via API REST | intégrer dans mon application multilingue |
| US-007 | Utilisateur | voir la transcription originale et la traduction côte à côte | comparer et valider la traduction |

### Epic 3 — Traitement de fichiers

| ID | En tant que | Je veux | Afin de |
|---|---|---|---|
| US-008 | Opérateur | uploader un fichier MP3/WAV/M4A jusqu'à 4 heures | traiter des réunions longues en batch |
| US-009 | Opérateur | voir la progression du traitement en temps réel | estimer le temps de complétion |
| US-010 | Opérateur | exporter en SRT, VTT, JSON ou texte brut | utiliser le résultat dans mon workflow |

### Epic 4 — Diarisation & qualité

| ID | En tant que | Je veux | Afin de |
|---|---|---|---|
| US-011 | Utilisateur | activer la diarisation pour identifier les locuteurs | distinguer SPEAKER_01, SPEAKER_02 dans la transcription |
| US-012 | Utilisateur | que les mots de remplissage (um, uh, euh) soient supprimés | obtenir un transcript propre |
| US-013 | Administrateur | voir les statistiques d'usage par utilisateur | gérer les quotas de la plateforme |

---

## 3. Business Rules

### BR-001 — Pipeline audio

```
1. Browser MediaRecorder → chunks WebM/Opus 250ms
2. WebSocket binary frames → FastAPI endpoint
3. Silero VAD → segmentation par pauses (min 0.5s parole, max 2s silence)
4. Accumulation des segments → envoi à Whisper
5. Whisper → transcript + timestamps mots
6. Si source != target → NLLB-200 traduction
7. Réponse streaming via WebSocket → frontend
```

### BR-002 — Configuration Whisper

```python
whisper_config = {
    "model": "large-v3",
    "beam_size": 5,
    "best_of": 5,
    "temperature": 0,
    "language": None,      # None = auto-detection
    "word_timestamps": True,
    "vad_filter": True,
    "vad_parameters": {
        "min_speech_duration_ms": 500,
        "max_silence_duration_ms": 2000,
        "threshold": 0.5
    }
}
```

### BR-003 — Voice Activity Detection (VAD)

```
Modèle : silero-vad (ONNX, CPU inference)
Seuil de détection : probabilité speech > 0.5
Min durée parole : 500 ms
Max durée silence avant coupure : 2 000 ms
Chunk de traitement : 512 samples (16kHz)
```

### BR-004 — Confiance et marquage unclear

```python
# Segment marqué [unclear] si
if segment.no_speech_prob > 0.60:
    text = "[unclear]"
elif avg_word_probability < 0.40:
    text = f"[unclear: {segment.text}]"
```

### BR-005 — Post-processing du transcript

```python
FILLER_WORDS = {"um", "uh", "euh", "eh", "hmm", "hm", "erm"}

def clean_transcript(text: str) -> str:
    words = text.split()
    return " ".join(w for w in words if w.lower() not in FILLER_WORDS)
```

### BR-006 — Formats d'export

```
plain    → texte brut sans horodatage
srt      → SubRip format (numéro, timecode, texte)
vtt      → WebVTT format (WEBVTT header, timecodes)
json     → [{start, end, text, words: [{word, start, end, prob}]}]
```

### BR-007 — Diarisation optionnelle

```python
# pyannote.audio pipeline
diarization = pipeline("speaker-diarization", use_auth_token=HF_TOKEN)
diarize_result = diarization(audio_file)
# Attribution : SPEAKER_00, SPEAKER_01, ... par segment temporel
# Fusion avec timestamps Whisper pour labelling final
```

### BR-008 — Limites par mode

| Mode | Durée max | Format | Temps traitement |
|---|---|---|---|
| Temps réel (WebRTC) | 30 minutes | stream | ~200ms par segment |
| Batch (upload fichier) | 4 heures | MP3/WAV/M4A/OGG | ~10% de la durée |

### BR-009 — Confidentialité des données

```
Politique par défaut : audio supprimé immédiatement après traitement
Option optionnelle : stockage 24h dans GCS chiffré (AES-256)
Aucun log du contenu audio en production
Transcriptions stockées uniquement si utilisateur activé opt-in
```

### BR-010 — Quotas

```
Free tier   : 10 heures/mois cumulées (batch + temps réel)
Paid tier   : illimité, facturation à la minute
Rate limit  : 5 sessions WebSocket simultanées max par utilisateur
```

### BR-011 — Fallback ASR

```
Si Whisper latency > 3s pour un segment :
    → Fallback vers Deepgram API (nova-2 model)
    → Marquage du segment avec source="deepgram"
```

### BR-012 — Supported languages (extrait)

```
Whisper : 99 langues dont fr, en, es, de, it, pt, zh, ja, ko, ar, ru, hi
NLLB-200 : 200 langues (flores-200 code) — toutes paires de traduction
```

---

## 4. Architecture Overview

```
Browser / Client
Next.js 14 · TypeScript · Tailwind CSS
WebRTC (getUserMedia, MediaRecorder)
        |
        | WebSocket (audio chunks) / HTTPS (REST)
        v
FastAPI Backend (Python 3.11)
/ws/transcribe  /api/upload  /api/sessions  /api/export
faster-whisper (CTranslate2) · NLLB-200 (transformers)
silero-vad · ffmpeg-python · pyannote.audio
        |                       |
        v                       v
PostgreSQL                 GCP Cloud Run GPU
Sessions, Transcriptions   NVIDIA L4 (Whisper inference)
        |
        v
Redis
Job queue (batch uploads)
        |
        v
Deepgram API (fallback)
```

---

## 5. Mono-repo Structure

```
voicetranslate/
├── frontend/
│   ├── src/app/
│   │   ├── page.tsx                    # Home — bouton micro
│   │   ├── transcribe/page.tsx         # Session temps réel
│   │   ├── upload/page.tsx             # Batch file upload
│   │   └── history/page.tsx            # Historique sessions
│   └── src/components/
│       ├── MicrophoneButton.tsx        # WebRTC getUserMedia
│       ├── LiveTranscript.tsx          # Streaming text
│       ├── LanguageSelector.tsx        # Source + target lang
│       ├── ExportPanel.tsx             # SRT/VTT/JSON download
│       ├── SpeakerTimeline.tsx         # Diarisation display
│       └── AudioUploader.tsx           # Drag drop fichiers
│
├── backend/
│   └── app/
│       ├── main.py
│       ├── api/
│       │   ├── websocket.py            # /ws/transcribe endpoint
│       │   ├── upload.py               # Batch file processing
│       │   ├── sessions.py             # Session management
│       │   └── export.py              # Format conversion
│       └── audio/
│           ├── vad.py                  # Silero VAD
│           ├── whisper_engine.py       # faster-whisper wrapper
│           ├── translator.py           # NLLB-200 inference
│           ├── diarizer.py             # pyannote.audio
│           ├── postprocessor.py        # Filler removal, cleanup
│           └── exporter.py            # SRT/VTT/JSON/plain
│
├── .github/workflows/
│   ├── ci.yml
│   └── deploy-cloud-run.yml
├── cloudbuild.yaml
├── docker-compose.yml
└── README.md
```

---

## 6. WebRTC & Audio Pipeline Specification

### Implémentation WebRTC côté navigateur

```typescript
// MicrophoneButton.tsx
const startRecording = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'audio/webm;codecs=opus'
  });

  const ws = new WebSocket(`wss://api.voicetranslate.wikolabs.com/ws/transcribe`);

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
      ws.send(event.data);
    }
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    // data: { text, start, end, speaker, source_lang, translation }
    appendToTranscript(data);
  };

  mediaRecorder.start(250); // chunks de 250ms
};
```

### Pipeline serveur (FastAPI WebSocket)

```python
@app.websocket("/ws/transcribe")
async def transcribe_websocket(websocket: WebSocket, target_lang: str = "fr"):
    await websocket.accept()
    audio_buffer = bytearray()

    async for chunk in websocket.iter_bytes():
        audio_buffer.extend(chunk)
        pcm = convert_webm_to_pcm(bytes(audio_buffer))

        if vad.has_speech(pcm):
            segments = whisper_engine.transcribe(pcm)
            for seg in segments:
                if seg.no_speech_prob < 0.6:
                    translation = translator.translate(seg.text, target_lang)
                    await websocket.send_json({
                        "text": seg.text,
                        "translation": translation,
                        "start": seg.start,
                        "end": seg.end,
                        "words": seg.words,
                        "source_lang": seg.language
                    })
            audio_buffer.clear()
```

---

## 7. UML Diagrams

### 7.1 WebRTC → Whisper → NLLB Pipeline

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': {'primaryColor': '#0891b2', 'tertiaryColor': '#0f172a'}}}%%
flowchart LR
    classDef browser fill:#1e3a5f,stroke:#3b82f6,color:#fff
    classDef server fill:#14532d,stroke:#22c55e,color:#fff
    classDef ai fill:#4a1d96,stroke:#a78bfa,color:#fff
    classDef output fill:#7c2d12,stroke:#f97316,color:#fff

    A[Browser\ngetUserMedia]:::browser -->|MediaRecorder\naudio/webm 250ms chunks| B[WebSocket\nFastAPI]:::server
    B --> C[ffmpeg-python\nWebM to PCM 16kHz]:::server
    C --> D[Silero VAD\nspeech detection]:::server
    D -->|speech segment| E[faster-whisper\nlarge-v3]:::ai
    D -->|silence| B
    E --> F[Word timestamps\nlanguage detection]:::ai
    F --> G{Source != Target?}
    G -->|Yes| H[NLLB-200-distilled\n600M translation]:::ai
    G -->|No| I[Post-processing\nfiller removal]:::server
    H --> I
    I --> J[WebSocket response\nJSON streaming]:::output
    J --> K[Browser\nLive transcript display]:::browser

    style E fill:#4a1d96,stroke:#a78bfa
    style H fill:#4a1d96,stroke:#a78bfa
```

### 7.2 Sequence Diagram — WebSocket Streaming

```mermaid
%%{init: {'theme': 'dark'}}%%
sequenceDiagram
    participant Browser
    participant WS as WebSocket FastAPI
    participant VAD as Silero VAD
    participant Whisper as Whisper large-v3
    participant NLLB as NLLB-200
    participant DB as PostgreSQL

    Browser->>WS: Connect ws://api/ws/transcribe?target=fr
    WS-->>Browser: Connected, session_id

    loop Audio recording
        Browser->>WS: Binary frame (250ms WebM chunk)
        WS->>VAD: PCM 16kHz
        alt Speech detected
            VAD->>Whisper: Audio segment
            Whisper-->>VAD: transcript + timestamps + lang
            VAD->>NLLB: text + source_lang + target_lang
            NLLB-->>VAD: translated_text
            WS-->>Browser: JSON {text, translation, start, end, speaker}
            WS->>DB: INSERT transcription_segment
        else Silence
            Note over VAD: Buffer, wait for more audio
        end
    end

    Browser->>WS: Close connection
    WS->>DB: UPDATE session status=completed
```

### 7.3 Language Detection State Machine

```mermaid
%%{init: {'theme': 'dark'}}%%
stateDiagram-v2
    [*] --> Listening
    Listening --> VADActive : speech_prob > 0.5
    VADActive --> Buffering : accumulate 0.5s+ of speech
    Buffering --> Transcribing : silence > 2s OR buffer > 30s
    Transcribing --> LanguageDetected : Whisper identifies source lang
    LanguageDetected --> Translating : source_lang != target_lang
    LanguageDetected --> PostProcessing : source_lang == target_lang
    Translating --> PostProcessing : NLLB translation complete
    PostProcessing --> Streaming : clean + format text
    Streaming --> Listening : response sent to browser
    Transcribing --> Unclear : no_speech_prob > 0.6
    Unclear --> Listening : mark segment as unclear
```

### 7.4 Entity-Relationship Diagram

```mermaid
%%{init: {'theme': 'dark'}}%%
erDiagram
    SESSION {
        uuid id PK
        uuid user_id FK
        string mode
        string source_lang
        string target_lang
        boolean diarization_enabled
        int duration_seconds
        string status
        timestamp started_at
        timestamp ended_at
    }
    TRANSCRIPTION_SEGMENT {
        uuid id PK
        uuid session_id FK
        float start_time
        float end_time
        text original_text
        text translated_text
        string source_lang
        string speaker_label
        float confidence
        boolean is_unclear
        jsonb word_timestamps
        timestamp created_at
    }
    EXPORT {
        uuid id PK
        uuid session_id FK
        string format
        string gcs_path
        int file_size_bytes
        timestamp created_at
    }
    USER {
        uuid id PK
        string email
        string tier
        int monthly_minutes_used
        int monthly_minutes_quota
        timestamp created_at
    }

    USER ||--o{ SESSION : starts
    SESSION ||--o{ TRANSCRIPTION_SEGMENT : contains
    SESSION ||--o{ EXPORT : generates
```

---

## 8. API Reference

### Base URL : `https://api.voicetranslate.wikolabs.com/v1`

#### WebSocket /ws/transcribe

Connexion WebSocket pour transcription temps réel.

```
wss://api.voicetranslate.wikolabs.com/ws/transcribe
  ?target_lang=fr
  &diarization=false
  &clean_fillers=true

Authorization: Bearer <token> (header ou query param)
```

**Frames envoyées :** binaire WebM/Opus (250ms chunks)

**Messages reçus (JSON) :**

```json
{
  "type": "transcript",
  "session_id": "sess_8a3c1f",
  "segment_id": "seg_001",
  "text": "Bonjour à tous, commençons la réunion.",
  "translation": "Hello everyone, let's start the meeting.",
  "start": 0.52,
  "end": 3.14,
  "source_lang": "fr",
  "speaker": "SPEAKER_01",
  "confidence": 0.94,
  "words": [
    {"word": "Bonjour", "start": 0.52, "end": 0.98, "prob": 0.98},
    {"word": "à", "start": 1.02, "end": 1.10, "prob": 0.96}
  ]
}
```

**Message de fin :**

```json
{"type": "session_end", "session_id": "sess_8a3c1f", "total_duration": 847.3}
```

#### POST /upload/audio

Upload d'un fichier audio pour traitement batch.

```http
POST /upload/audio
Content-Type: multipart/form-data
Authorization: Bearer <token>

file: <audio file MP3/WAV/M4A/OGG>
source_lang: auto
target_lang: en
diarization: true
clean_fillers: true
```

Response 202:

```json
{
  "job_id": "job_f2d8a1",
  "session_id": "sess_9b4e2c",
  "status": "queued",
  "file_duration_seconds": 3642,
  "estimated_minutes": 6
}
```

#### GET /jobs/{job_id}/status

Statut d'un job batch.

```json
{
  "job_id": "job_f2d8a1",
  "status": "processing",
  "progress_pct": 47,
  "segments_done": 382,
  "estimated_remaining_seconds": 180
}
```

#### GET /sessions/{session_id}/transcript

Récupère la transcription complète d'une session.

```json
{
  "session_id": "sess_9b4e2c",
  "source_lang": "en",
  "target_lang": "fr",
  "duration_seconds": 3642,
  "segments": [
    {
      "start": 0.0,
      "end": 4.2,
      "speaker": "SPEAKER_01",
      "original": "Good morning everyone, let's get started.",
      "translation": "Bonjour à tous, commençons.",
      "confidence": 0.96
    }
  ]
}
```

#### POST /sessions/{session_id}/export

Exporte la transcription dans un format donné.

```http
POST /sessions/sess_9b4e2c/export
Content-Type: application/json

{"format": "srt", "include_translation": true, "include_speaker": true}
```

Response 200: fichier SRT en streaming ou lien GCS presigned URL.

---

## 9. UI Simulation Guide

### Écran 1 — Home — Bouton Microphone

Objectif : démarrer une transcription temps réel en un clic.

- Bouton central animé (pulsating) : Démarrer l'enregistrement
- Indicateur niveau sonore (wave visualizer) via Web Audio API
- Selector langue source (dropdown 99 langues) avec badge AUTO
- Selector langue cible (dropdown 200 langues)
- Toggle Diarisation (identifier les locuteurs)

### Écran 2 — Transcription Live

Objectif : voir le transcript apparaître en temps réel.

- Zone de texte scrollable avec les segments qui apparaissent
- Labels SPEAKER_01 / SPEAKER_02 en couleurs distinctes
- Mots unclear surlignés en orange
- Colonne droite : traduction simultanée
- Badge latence : temps entre parole et texte affiché
- Bouton Stop + Save

### Écran 3 — Upload Batch

Objectif : traiter un fichier audio long.

- Drag & drop zone : MP3, WAV, M4A, OGG (max 4h)
- Barre de progression : segments traités / total
- Aperçu des 5 premiers segments en temps réel
- ETA mis à jour dynamiquement

### Écran 4 — Export Panel

Objectif : télécharger le résultat dans le format souhaité.

- Tabs : Plain Text / SRT / VTT / JSON
- Preview du contenu dans chaque format
- Toggle : inclure la traduction / inclure les labels locuteurs
- Bouton Télécharger pour chaque format
- Bouton Copier dans le presse-papier

---

## 10. Database Schema

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    tier VARCHAR(50) DEFAULT 'free',
    monthly_minutes_used INTEGER DEFAULT 0,
    monthly_minutes_quota INTEGER DEFAULT 600,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    mode VARCHAR(50) NOT NULL,
    source_lang VARCHAR(20),
    target_lang VARCHAR(20),
    diarization_enabled BOOLEAN DEFAULT FALSE,
    duration_seconds FLOAT,
    status VARCHAR(50) DEFAULT 'active',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);

CREATE TABLE transcription_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id),
    start_time FLOAT NOT NULL,
    end_time FLOAT NOT NULL,
    original_text TEXT,
    translated_text TEXT,
    source_lang VARCHAR(20),
    speaker_label VARCHAR(50),
    confidence FLOAT,
    is_unclear BOOLEAN DEFAULT FALSE,
    word_timestamps JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id),
    format VARCHAR(20) NOT NULL,
    gcs_path VARCHAR(500),
    file_size_bytes INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_segments_session ON transcription_segments(session_id, start_time);
CREATE INDEX idx_sessions_user ON sessions(user_id, started_at DESC);
```

---

## 11. Infrastructure & Deployment

### cloudbuild.yaml — Cloud Run GPU NVIDIA L4

```yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/voicetranslate-backend:$SHORT_SHA', './backend']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/voicetranslate-backend:$SHORT_SHA']
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: 'gcloud'
    args:
      - run
      - deploy
      - voicetranslate-backend
      - '--image=gcr.io/$PROJECT_ID/voicetranslate-backend:$SHORT_SHA'
      - '--region=us-central1'
      - '--platform=managed'
      - '--gpu=1'
      - '--gpu-type=nvidia-l4'
      - '--memory=16Gi'
      - '--cpu=4'
      - '--concurrency=10'
      - '--timeout=1800'
      - '--no-allow-unauthenticated'
      - '--set-env-vars=WHISPER_MODEL=large-v3'
```

### Backend Dockerfile

```dockerfile
FROM pytorch/pytorch:2.2.0-cuda12.1-cudnn8-runtime
WORKDIR /app

RUN apt-get update && apt-get install -y ffmpeg libsndfile1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/
ENV PYTHONUNBUFFERED=1
EXPOSE 8080
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080", "--ws", "websockets"]
```

### requirements.txt

```
fastapi==0.111.0
uvicorn[standard]==0.30.0
websockets==12.0
faster-whisper==1.0.1
transformers==4.41.0
torch==2.2.0
ffmpeg-python==0.2.0
silero-vad==5.1.2
pyannote.audio==3.1.1
redis==5.0.4
sqlalchemy==2.0.30
asyncpg==0.29.0
psycopg2-binary==2.9.9
alembic==1.13.1
pydantic==2.7.1
deepgram-sdk==3.2.7
google-cloud-storage==2.17.0
```

### docker-compose.yml

```yaml
version: '3.9'
services:
  backend:
    build: ./backend
    ports: ["8000:8080"]
    environment:
      - DATABASE_URL=postgresql://vt:vt@db:5432/voicetranslate
      - REDIS_URL=redis://redis:6379
      - DEEPGRAM_API_KEY=${DEEPGRAM_API_KEY}
    depends_on: [db, redis]

  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    environment:
      - NEXT_PUBLIC_WS_URL=ws://localhost:8000
      - NEXT_PUBLIC_API_URL=http://localhost:8000

  db:
    image: postgres:16
    environment:
      POSTGRES_USER: vt
      POSTGRES_PASSWORD: vt
      POSTGRES_DB: voicetranslate
    volumes: [pgdata:/var/lib/postgresql/data]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

volumes:
  pgdata:
```

---

## 12. CI/CD Pipeline

```yaml
name: CI voicetranslate
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env: {POSTGRES_USER: test, POSTGRES_PASSWORD: test, POSTGRES_DB: vt_test}
        ports: ["5432:5432"]
      redis:
        image: redis:7-alpine
        ports: ["6379:6379"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: {python-version: '3.11'}
      - run: sudo apt-get install -y ffmpeg
      - run: pip install -r backend/requirements.txt pytest pytest-asyncio httpx
      - run: pytest backend/tests/ -v
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/vt_test
          REDIS_URL: redis://localhost:6379
          MOCK_WHISPER: "true"

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: {node-version: '20'}
      - run: npm ci && npm run build
        working-directory: frontend

  deploy:
    needs: [test-backend, test-frontend]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}
      - uses: google-github-actions/setup-gcloud@v2
      - run: gcloud builds submit --config cloudbuild.yaml
```

---

## 13. Kaggle Dataset

**Dataset : common-voice-corpus (Mozilla Common Voice)**

| Attribut | Valeur |
|---|---|
| Source | Mozilla Foundation via Kaggle / HuggingFace |
| Langues | 100+ langues humaines |
| Format | MP3 + TSV (sentence, speaker, accent, age, gender) |
| Volume | Des milliers d'heures selon la langue (en : 2800h+) |
| Licence | CC-0 (domaine public) |

**Usage dans voicetranslate :**
- Benchmarking du WER (Word Error Rate) de Whisper large-v3 par langue
- Tests de la détection automatique de langue sur des accents variés
- Validation du pipeline VAD sur des enregistrements réels multi-locuteurs
- Génération de jeux de test pour l'évaluation de la diarisation

**Téléchargement (exemple langue française) :**
```bash
pip install datasets
python -c "
from datasets import load_dataset
ds = load_dataset('mozilla-foundation/common_voice_13_0', 'fr', split='test[:100]')
ds.save_to_disk('backend/data/common_voice_fr_test')
"
```

**Métriques cibles sur Common Voice :**
```
WER Whisper large-v3 (en)  : < 4%
WER Whisper large-v3 (fr)  : < 8%
WER Whisper large-v3 (es)  : < 5%
Latence p95 par segment    : < 800ms sur NVIDIA L4
```

---

## 14. Local Development

### Prérequis

- Python 3.11+, Node.js 20+, Docker & Docker Compose
- ffmpeg installé localement (sudo apt install ffmpeg ou brew install ffmpeg)
- Navigateur moderne avec support WebRTC (Chrome, Firefox, Safari)

### Installation

```bash
git clone https://github.com/Wikolabs/voicetranslate.git
cd voicetranslate

# Via Docker Compose (recommandé)
docker compose up --build

# Backend seul mode mock
cd backend && pip install -r requirements.txt
MOCK_WHISPER=true uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend && npm install && npm run dev
```

### Variables d'environnement

| Variable | Description | Exemple |
|---|---|---|
| DATABASE_URL | PostgreSQL connection | postgresql://user:pass@localhost:5432/voicetranslate |
| REDIS_URL | Redis pour job queue | redis://localhost:6379 |
| DEEPGRAM_API_KEY | Fallback ASR | dg_xxxx |
| GCS_BUCKET | Bucket exports | voicetranslate-exports |
| HF_TOKEN | HuggingFace pour pyannote | hf_xxxx |
| MOCK_WHISPER | Mode CPU sans GPU | true en dev |
| GCP_PROJECT_ID | Projet GCP | wikolabs-prod |

### Test WebRTC en local

HTTPS requis pour getUserMedia. En développement :

```bash
# Générer un certificat auto-signé
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Lancer avec SSL
uvicorn app.main:app --ssl-keyfile key.pem --ssl-certfile cert.pem --port 8000
```

---

*Wikolabs — voicetranslate · Real-Time Multilingual Speech Transcription & Translation · v1.0.0*
