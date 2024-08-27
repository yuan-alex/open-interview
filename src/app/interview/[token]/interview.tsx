"use client";

import { useCallback, useEffect, useState } from "react";
import { MonacoBinding } from "y-monaco";
import * as Y from "yjs";
import { type YSweetProvider, createYjsProvider } from "@y-sweet/client";
import { Editor } from "@monaco-editor/react";
import { type editor } from "monaco-editor";

import { runCode } from "../../../app/actions";
import { supportedLanguages } from "../../../utils/languages";

const themes = ["vs-light", "vs-dark"];

interface InterviewProps {
  authToken: string;
  ySweetAuth: any;
}

export default function Interview(props: InterviewProps) {
  const [editorLanguage, setEditorLanguage] = useState(
    supportedLanguages.find((lang) => lang.id === 63),
  );
  const [editorFontSize, setEditorFontSize] = useState(15);
  const [editorTheme, setEditorTheme] = useState();

  const [codeResultHistory, setCodeResultHistory] = useState([]);

  const [provider, setProvider] = useState<YSweetProvider>();
  const [yCodeSubmissions, setYCodeSubmissions] = useState<Y.Array<any>>();
  const [editorRef, setEditorRef] = useState<editor.IStandaloneCodeEditor>();

  const handleSubmitCode = useCallback(async () => {
    const result = await runCode(
      props.authToken,
      editorLanguage!!.id,
      editorRef?.getModel()?.getValue() || "",
    );
    yCodeSubmissions.insert(0, [result]);
  }, [editorRef, editorLanguage, props.authToken, yCodeSubmissions]);

  const handleOnMount = useCallback((e: editor.IStandaloneCodeEditor) => {
    setEditorRef(e);
  }, []);

  useEffect(() => {
    let yProvider: any;
    let yDoc: Y.Doc;
    let binding: MonacoBinding;

    if (editorRef) {
      yDoc = new Y.Doc();
      const yText = yDoc.getText("editor");
      const yProvider = createYjsProvider(yDoc, props.ySweetAuth);
      setProvider(yProvider);

      binding = new MonacoBinding(
        yText,
        editorRef.getModel() as editor.ITextModel,
        new Set([editorRef]),
        yProvider.awareness,
      );

      const yArr = yDoc.getArray("code_submissions");
      setYCodeSubmissions(yArr);

      yArr.observe((event) => {
        for (const item of Array.from(event.changes.added)) {
          setCodeResultHistory((prev) => [item.content.arr[0], ...prev]);
        }
      });
    }

    return () => {
      yDoc?.destroy();
      yProvider?.destroy();
      binding?.destroy();
    };
  }, [editorRef, props]);

  return (
    <div>
      <dialog id="settings-modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-xl mb-5">Editor settings</h3>
          <p className="text-sm font-medium mb-1">Theme</p>
          <select
            className="select select-bordered w-full"
            value={editorTheme}
            onChange={(event) => setEditorTheme(event.target.value)}
          >
            {themes.map((theme) => (
              <option key={theme} value={theme}>
                {theme}
              </option>
            ))}
          </select>
          <p className="text-sm font-medium mb-1 mt-6">Font size (px)</p>
          <input
            type="number"
            placeholder="Type here"
            className="input input-bordered w-full"
            value={editorFontSize}
            onChange={(event) => setEditorFontSize(event.target.value)}
          />
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
      <div className="h-screen flex divide-x">
        <div className="flex w-2/3 flex-grow flex-col">
          <nav className="p-2 flex items-center space-x-2 border-b">
            <p className="text-lg font-light">Open Interview</p>
            <span className="flex-grow" />
            <select
              className="select select-bordered select-sm"
              value={editorLanguage.id}
              onChange={(event) =>
                setEditorLanguage(
                  supportedLanguages.find(
                    (lang) => lang.id == event.target.value,
                  ),
                )
              }
            >
              {supportedLanguages.map((language) => (
                <option key={language.id} value={language.id}>
                  {language.label}
                </option>
              ))}
            </select>
            <button
              className="btn btn-sm"
              onClick={() =>
                document.getElementById("settings-modal")?.showModal()
              }
            >
              Editor settings
            </button>
          </nav>
          <div className="flex-grow">
            <Editor
              onMount={handleOnMount}
              height="100%"
              width="100hw"
              theme={editorTheme}
              language={editorLanguage.name}
              defaultValue=""
              options={{
                fontSize: editorFontSize,
              }}
            />
          </div>
        </div>
        <div className="w-1/3 flex-grow flex flex-col h-full">
          <div className="flex-grow overflow-y-scroll h-full">
            {codeResultHistory.length > 0 ? (
              <div className="flex flex-col">
                {codeResultHistory.map((result) => (
                  <div key={result.id} className="p-3">
                    <div className="mb-3">
                      <div className="badge">{result.languageLabel}</div>
                    </div>
                    <pre className="p-3 bg-black text-white rounded text-sm font-mono overflow-x-auto">
                      {result.stdout ?? result.stderr ?? result.compileOutput}
                    </pre>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10">
                <p className="mb-3 text-2xl font-semibold">Ready to start</p>
                <p>
                  Click the run button to run the code in your editor. Everyone
                  in the session will be able to see the output.
                </p>
              </div>
            )}
          </div>
          <div className="flex space-x-2 border-t p-2 bg-white">
            <button
              className="btn btn-success btn-sm"
              onClick={handleSubmitCode}
            >
              Run
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
