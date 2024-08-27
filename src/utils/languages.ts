interface LanguageSupport {
  id: number;
  name: string;
  label: string;
}

export const supportedLanguages: LanguageSupport[] = [
  { id: 75, name: "c", label: "C (Clang 7.0.1)" },
  { id: 76, name: "cpp", label: "C++ (Clang 7.0.1)" },
  { id: 50, name: "c", label: "C (GCC 9.2.0)" },
  { id: 54, name: "cpp", label: "C++ (GCC 9.2.0)" },
  { id: 86, name: "clojure", label: "Clojure (1.10.1)" },
  { id: 51, name: "csharp", label: "C# (Mono 6.6.0.161)" },
  { id: 55, name: "lisp", label: "Common Lisp (SBCL 2.0.0)" },
  { id: 57, name: "elixir", label: "Elixir (1.9.4)" },
  { id: 58, name: "erlang", label: "Erlang (OTP 22.2)" },
  { id: 87, name: "fsharp", label: "F# (.NET Core SDK 3.1.202)" },
  { id: 60, name: "go", label: "Go (1.13.5)" },
  { id: 88, name: "groovy", label: "Groovy (3.0.3)" },
  { id: 61, name: "haskell", label: "Haskell (GHC 8.8.1)" },
  { id: 96, name: "javafx", label: "JavaFX (JDK 17.0.6, OpenJFX 22.0.2)" },
  { id: 91, name: "java", label: "Java (JDK 17.0.6)" },
  { id: 62, name: "java", label: "Java (OpenJDK 13.0.1)" },
  { id: 63, name: "javascript", label: "JavaScript (Node.js 12.14.0)" },
  { id: 78, name: "kotlin", label: "Kotlin (1.3.70)" },
  { id: 64, name: "lua", label: "Lua (5.3.5)" },
  { id: 79, name: "objective-c", label: "Objective-C (Clang 7.0.1)" },
  { id: 65, name: "ocaml", label: "OCaml (4.09.0)" },
  { id: 66, name: "octave", label: "Octave (5.1.0)" },
  { id: 67, name: "pascal", label: "Pascal (FPC 3.0.4)" },
  { id: 85, name: "perl", label: "Perl (5.28.1)" },
  { id: 68, name: "php", label: "PHP (7.4.1)" },
  { id: 70, name: "python", label: "Python (2.7.17)" },
  { id: 71, name: "python", label: "Python (3.8.1)" },
  { id: 80, name: "r", label: "R (4.0.0)" },
  { id: 72, name: "ruby", label: "Ruby (2.7.0)" },
  { id: 73, name: "rust", label: "Rust (1.40.0)" },
  { id: 81, name: "scala", label: "Scala (2.13.2)" },
  { id: 83, name: "swift", label: "Swift (5.2.3)" },
];

export const getLanguageById = (id: number) => {
  return supportedLanguages.find((language) => language.id === id);
};
