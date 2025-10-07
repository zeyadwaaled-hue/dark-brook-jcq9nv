import React, { useState } from "react";

// Dark-themed React component adjusted to accept 'EELU ID' and flexible section names
export default function App() {
  const [csvText, setCsvText] = useState("");
  const [students, setStudents] = useState([]);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");

  const palette = {
    bg: "bg-gray-900",
    card: "bg-gray-800/60",
    accent: "text-sky-300",
    text: "text-gray-100",
  };

  const schedules = {
    S1: [
      {
        day: "Saturday",
        items: [
          { name: "Probability", time: "9:00 - 10:00" },
          { name: "OOP", time: "10:00 - 11:00" },
          { name: "Database", time: "11:00 - 11:00" },
        ],
      },
      { day: "Sunday", items: [{ name: "Math3", time: "11:00 - 12:00" }] },
      {
        day: "Monday",
        items: [
          { name: "Network", time: "11:00 - 12:00" },
          { name: "Software", time: "12:00 - 13:00" },
        ],
      },
    ],
    S2: [
      {
        day: "Saturday",
        items: [
          { name: "Probability", time: "13:00 - 14:00" },
          { name: "Database", time: "14:00 - 15:00" },
          { name: "OOP", time: "15:00 - 16:00" },
          { name: "Math3", time: "17:00 - 18:00" },
        ],
      },
      {
        day: "Monday",
        items: [
          { name: "Software", time: "11:00 - 12:00" },
          { name: "Network", time: "12:00 - 13:00" },
        ],
      },
    ],
  };

  function parseCSV(text) {
    const rows = [];
    const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
    if (lines.length === 0) return [];
    const header = splitRow(lines[0]).map((h) => h.trim().toLowerCase());
    for (let i = 1; i < lines.length; i++) {
      const row = splitRow(lines[i]);
      if (row.length === 0) continue;
      const obj = {};
      for (let j = 0; j < header.length; j++) {
        obj[header[j]] = row[j] ? row[j].trim() : "";
      }
      rows.push(obj);
    }
    return rows;
  }

  function splitRow(row) {
    const result = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      if (char === '"') {
        inQuotes = !inQuotes;
        continue;
      }
      if (char === "," && !inQuotes) {
        result.push(cur);
        cur = "";
        continue;
      }
      cur += char;
    }
    result.push(cur);
    return result;
  }

  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      setCsvText(text);
      const parsed = parseCSV(text);
      const mapped = parsed.map((r) => ({
        name: r.name || r[Object.keys(r)[0]] || "",
        studentid: (
          r.studentid ||
          r.id ||
          r["eelu id"] ||
          r[Object.keys(r)[1]] ||
          ""
        )
          .toString()
          .trim(),
        section: (r.section || r.s || r[Object.keys(r)[2]] || "")
          .toString()
          .trim(),
      }));
      setStudents(mapped);
      setMessage(`Loaded ${mapped.length} rows`);
      setResult(null);
    };
    reader.readAsText(file);
  }

  function normalizeSection(section) {
    if (!section) return null;
    const clean = section.toString().toUpperCase().replace(/\s+/g, "");
    const match = clean.match(/S0*(\d+)/);
    return match ? `S${parseInt(match[1], 10)}` : clean;
  }

  function onSearch(e) {
    e.preventDefault();
    if (!query) return;
    const found = students.find(
      (s) => s.studentid.toLowerCase() === query.trim().toLowerCase()
    );
    if (!found) {
      setResult({ notFound: true });
      return;
    }
    const sectionKey = normalizeSection(found.section);
    const schedule = schedules[sectionKey] || null;
    setResult({ notFound: false, student: found, sectionKey, schedule });
  }

  return (
    <div className={`${palette.bg} min-h-screen p-6 font-sans`}>
      <div className="max-w-3xl mx-auto">
        <div
          className={`p-6 rounded-2xl shadow-2xl ${palette.card} ${palette.text}`}
        >
          <h1 className="text-3xl font-semibold mb-2">
            Student Section Lookup
          </h1>
          <p className="text-sm opacity-80 mb-4">
            Enter EELU ID to see your section & schedule.
          </p>

          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="block w-full text-sm mb-4"
          />

          <form onSubmit={onSearch} className="flex gap-3 w-full mb-4">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter EELU ID"
              className="flex-1 p-3 rounded-lg bg-gray-900 border border-gray-700"
            />
            <button
              type="submit"
              className="px-5 py-3 rounded-lg bg-sky-500 hover:bg-sky-400"
            >
              Search
            </button>
          </form>

          {message && <p className="mt-3 text-sm opacity-80">{message}</p>}

          <div className="mt-6">
            {result && result.notFound && (
              <div className="p-4 rounded-lg bg-red-700/10 border border-red-700 text-red-200">
                Student not found
              </div>
            )}

            {result && !result.notFound && (
              <div className="p-4 rounded-lg bg-gray-900/40 border border-gray-700">
                <h2 className="text-xl font-semibold mb-1">
                  {result.student.name || "—"}
                </h2>
                <p className="text-sm opacity-80 mb-3">
                  EELU ID:{" "}
                  <span className={palette.accent}>
                    {result.student.studentid}
                  </span>{" "}
                  • Section: <strong>{result.sectionKey}</strong>
                </p>

                <div className="mt-2 space-y-3">
                  {result.schedule ? (
                    result.schedule.map((day) => (
                      <div
                        key={day.day}
                        className="p-3 rounded-md bg-gray-800/30 border border-gray-700"
                      >
                        <div className="font-medium">{day.day}</div>
                        <div className="mt-1 text-sm opacity-85">
                          {day.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between">
                              <div>{it.name}</div>
                              <div className="opacity-80">{it.time}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm opacity-70">
                      No schedule found for this section.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
