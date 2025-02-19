"use client";

import { Editor } from "@monaco-editor/react";
import { Button } from "@radix-ui/themes";
import { useArray, useAwareness, useText } from "@y-sweet/react";
import type { editor } from "monaco-editor";
import { useCallback, useEffect, useState } from "react";
import { MonacoBinding } from "y-monaco";
import type * as Y from "yjs";

import { LanguageSelector } from "@/components/LanguageSelector";
import { SettingsDialog } from "@/components/SettingsDialog";
import { supportedLanguages } from "@/utils/languages";

interface InterviewProps {
  authToken: string;
}

export function Interview(props: InterviewProps) {
  const [editorLanguage, setEditorLanguage] = useState(
    supportedLanguages.find((lang) => lang.id === 63),
  );
  const [editorFontSize, setEditorFontSize] = useState(15);
  const [editorTheme, setEditorTheme] = useState("vs-dark");

  const awareness = useAwareness();
  const yText = useText("editor");
  const yCodeSubmissions = useArray<Y.Map<any>>("code_submissions");

  const [editorRef, setEditorRef] = useState<editor.IStandaloneCodeEditor>();

  const handleSubmitCode = useCallback(async () => {
    const response = await fetch("/api/code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        authToken: props.authToken,
        languageId: editorLanguage.id,
        sourceCode: editorRef?.getModel()?.getValue() || "",
      }),
    });
    const result = await response.json();

    yCodeSubmissions.insert(0, [result]);
  }, [editorRef, editorLanguage, props.authToken, yCodeSubmissions]);

  const handleOnMount = useCallback((e: editor.IStandaloneCodeEditor) => {
    setEditorRef(e);
  }, []);

  useEffect(() => {
    let binding: MonacoBinding;

    if (editorRef) {
      binding = new MonacoBinding(
        yText,
        editorRef.getModel() as editor.ITextModel,
        new Set([editorRef]),
        awareness,
      );
    }

    return () => {
      binding?.destroy();
    };
  }, [editorRef, props]);

  return (
    <div className="h-screen flex">
      <div className="flex w-2/3 grow flex-col">
        <nav className="p-2 flex items-center space-x-2">
          <p className="text-lg font-light">Open Interview</p>
          <span className="grow" />
          <LanguageSelector
            value={editorLanguage.id.toString()}
            onValueChange={(value) =>
              setEditorLanguage(
                supportedLanguages.find((lang) => lang.id == value),
              )
            }
          />
          <SettingsDialog
            theme={editorTheme}
            onThemeChange={(value) => setEditorTheme(value)}
            editorFontSize={editorFontSize}
            onEditorFontSizeChange={(value) => setEditorFontSize(value)}
          />
        </nav>
        <div className="grow">
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
      <div className="w-1/3 grow flex flex-col h-full">
        <div
          className="grow overflow-y-scroll h-full"
          data-testid="code-submissions"
        >
          {yCodeSubmissions.length > 0 ? (
            <div className="p-3 flex flex-col space-y-3">
              {yCodeSubmissions.map((result) => (
                <div
                  key={result.id}
                  className="p-4 rounded-sm overflow-x-auto"
                  style={{
                    backgroundColor: "var(--gray-2)",
                  }}
                >
                  <div className="text-xs mb-3">{result.languageLabel}</div>
                  <pre>
                    {result.stdout ?? result.stderr ?? result.compileOutput}
                  </pre>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10">
              <p className="mb-3 text-2xl font-semibold">Ready to start</p>
              <p>
                Click the run button to run the code in your editor. Everyone in
                the session will be able to see the output.
              </p>
            </div>
          )}
        </div>
        <div className="flex space-x-2 p-3">
          <Button id="run-code" onClick={handleSubmitCode}>
            Run
          </Button>
        </div>
      </div>
    </div>
  );
}
