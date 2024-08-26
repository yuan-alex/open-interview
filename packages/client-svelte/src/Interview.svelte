<script lang="ts">
import { type YSweetProvider, createYjsProvider } from "@y-sweet/client";
import { atom } from "nanostores";
import { onDestroy, onMount } from "svelte";
import { MonacoBinding } from "y-monaco";
import * as Y from "yjs";

import { supportedLanguages } from "../../backend-hono/src/utils/languages";
import monaco from "./lib/monaco";

// monaco
const themes = ["vs-light", "vs-dark"];

let editor: monaco.editor.IStandaloneCodeEditor;
let editorContainer: HTMLElement;

const interviewError = atom<string | null>(null);
const participant = atom(null);

const editorLanguage = atom(supportedLanguages.find((lang) => lang.id === 63));
const editorTheme = atom(themes[0]);
const editorFontSize = atom<number>(15);
const codeResultHistory = atom([]);

// yjs
const doc = new Y.Doc();
let provider: YSweetProvider;
let sharedEditor: Y.Text;
let codeSubmissions: Y.Array<any>;

const urlParams = new URLSearchParams(window.location.search);
const INTERVIEW_TOKEN = urlParams.get("token");

function getTokenFromStore() {
  return localStorage.getItem("auth_token") || "";
}

async function handleJoin() {
  try {
    const response = await fetch(`/api/interview/${INTERVIEW_TOKEN}/join`);
    const data = await response.json();
    participant.set(data);
    localStorage.setItem("auth_token", data.auth_token);
  } catch (error) {
    console.log(error);
    interviewError.set(
      "Could not find interview, are you sure you have the correct link?",
    );
  }
}

async function handleSubmitCode() {
  try {
    const response = await fetch("/api/interview/submit-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: getTokenFromStore(),
      },
      body: JSON.stringify({
        source_code: editor.getValue(),
        language_id: $editorLanguage.id,
      }),
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
  } catch (error) {
    console.error("failed to submit code:", error);
  }
}

const initYjs = () => {
  provider = createYjsProvider(doc, $participant.y_sweet);

  sharedEditor = doc.getText("editor");

  codeSubmissions = doc.getArray("code_submissions");
  codeSubmissions.observe((event) => {
    for (const item of event.changes.added) {
      codeResultHistory.set([item.content.arr[0], ...$codeResultHistory]);
    }
  });
};

const initMonaco = async () => {
  editor = monaco.editor.create(editorContainer, {
    fontSize: $editorFontSize,
    theme: $editorTheme,
  });
  const model = monaco.editor.createModel("", $editorLanguage.name);
  editor.setModel(model);

  new MonacoBinding(sharedEditor, model, new Set([editor]), provider.awareness);

  editorLanguage.subscribe((language) =>
    monaco.editor.setModelLanguage(model, language.name),
  );
  editorFontSize.subscribe((fontSize) => editor.updateOptions({ fontSize }));
  editorTheme.subscribe((theme) => editor.updateOptions({ theme }));
};

onMount(async () => {
  await handleJoin();
  initYjs();
  await initMonaco();
});

const parseData = (data: string) => {
  try {
    const parsed = JSON.parse(data);
    return parsed;
  } catch {
    return null;
  }
};

const handleClearSubmissions = () => {
  codeResultHistory.set([]);
};

onDestroy(() => {
  provider.disconnect();
  for (const model of monaco.editor.getModels()) {
    model.dispose();
  }
  editor.dispose();
});
</script>

<!--
<dialog id="onboarding-modal" class="modal">
  <div class="modal-box">
    <h3 class="font-bold text-xl">👋 Welcome to your interview!</h3>
    <p class="py-4">Press ESC key or click the button below to close</p>
    <input
      id="onboarding-name-input"
      type="text"
      placeholder="Your name"
      class="input input-bordered w-full"
    />
    <div class="modal-action">
      <form method="dialog">
        <button class="btn" on:click={handleJoin}>Join</button>
      </form>
    </div>
  </div>
</dialog>
-->

{#if $interviewError}
  <div class="h-screen flex justify-center items-center">
    {$interviewError}
  </div>
{/if}

<dialog id="settings-modal" class="modal">
  <div class="modal-box">
    <h3 class="font-bold text-xl mb-5">Editor settings</h3>
    <p class="text-sm font-medium mb-1">Theme</p>
    <select
      class="select select-bordered w-full"
      value={$editorTheme}
      on:change={(event) => editorTheme.set(event.target.value)}
    >
      {#each themes as key}
        <option value={key}>{key}</option>
      {/each}
    </select>
    <p class="text-sm font-medium mb-1 mt-6">Font size (px)</p>
    <input
      type="number"
      placeholder="Type here"
      class="input input-bordered w-full"
      value={$editorFontSize}
      on:change={(event) => editorFontSize.set(event.target.value)}
    />
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

<div class="h-screen flex divide-x">
  <div class="flex w-2/3 flex-grow flex-col">
    <nav class="p-2 flex items-center space-x-2 border-b">
      <p class="text-lg font-light">Open Interview</p>
      <span class="flex-grow" />
      <select
        class="select select-bordered select-sm"
        value={$editorLanguage.id}
        on:change={(event) =>
          editorLanguage.set(
            supportedLanguages.find((lang) => lang.id == event.target.value),
          )}
      >
        {#each supportedLanguages as language}
          <option value={language.id}>{language.label}</option>
        {/each}
      </select>
      <button
        class="btn btn-sm"
        on:click={() => document.getElementById("settings-modal")?.showModal()}
      >
        Editor settings
      </button>
    </nav>
    <div class="flex-grow" bind:this={editorContainer} />
    <div class="flex items-center border-t p-2">
      <span class="flex-grow" />
      <div class="flex gap-2">
        <div class="badge">{$participant?.name}</div>
      </div>
    </div>
  </div>
  <div class="w-1/3 flex-grow flex flex-col h-full">
    <div class="flex-grow overflow-y-scroll h-full">
      {#if $codeResultHistory.length > 0}
        <div class="flex flex-col">
          {#each $codeResultHistory as result}
            <div class="p-3">
              <div class="mb-3">
                <div class="badge">
                  {result.language_label}
                </div>
              </div>
              <pre class="p-3 bg-black text-white rounded text-sm font-mono overflow-x-auto">{result.stdout ?? result.stderr ?? result.compile_output}</pre>
            </div>
          {/each}
        </div>
      {:else}
        <div class="p-10">
          <p class="mb-3 text-2xl font-semibold">Ready to start</p>
          <p>
            Click the run button to run the code in your editor. Everyone in the
            session will be able to see the output.
          </p>
        </div>
      {/if}
    </div>
    <div class="flex space-x-2 border-t p-2 bg-white">
      <button class="btn btn-success btn-sm" on:click={handleSubmitCode}>Run</button>
    </div>
  </div>
</div>
