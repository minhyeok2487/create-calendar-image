import React, { useState, useEffect, useCallback, useRef } from "react";
import StyledCalendar from "./components/StyledCalendar";
import html2canvas from "html2canvas";

const App: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [year, setYear] = useState<number>(2025);
  const [month, setMonth] = useState<number>(5);
  const [calendarData, setCalendarData] = useState<number[][] | null>(null);
  const [calendarBgOpacity, setCalendarBgOpacity] = useState<number>(0.8);

  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  const captureRef = useRef<HTMLDivElement>(null);
  const calendarWrapperRef = useRef<HTMLDivElement>(null);

  const handlePaste = useCallback((event: ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    Array.from(items).forEach((item) => {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          const url = URL.createObjectURL(file);
          setImageUrl(url);
        }
      }
    });
  }, []);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  useEffect(() => {
    const listener = (e: Event) => handlePaste(e as ClipboardEvent);
    window.addEventListener("paste", listener);
    return () => window.removeEventListener("paste", listener);
  }, [handlePaste]);

  const generateCalendar = (year: number, month: number): number[][] => {
    const firstDay = new Date(year, month - 1, 1).getDay();
    const lastDate = new Date(year, month, 0).getDate();
    const weeks: number[][] = [];
    let week: number[] = [];

    for (let i = 0; i < firstDay; i++) week.push(0);

    for (let d = 1; d <= lastDate; d++) {
      week.push(d);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }

    if (week.length > 0) {
      while (week.length < 7) week.push(0);
      weeks.push(week);
    }

    return weeks;
  };

  const handleAddCalendar = () => {
    if (!imageUrl) {
      alert("이미지를 먼저 넣어주세요!");
      return;
    }
    setCalendarData(generateCalendar(year, month));
    setPosition({
      x: 100,
      y: 100,
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setDragging(true);
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragging) return;
      setPosition({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y,
      });
    },
    [dragging, offset]
  );

  const handleMouseUp = () => setDragging(false);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startScale = scale;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const diff = moveEvent.clientX - startX;
      const newScale = Math.max(0.5, Math.min(2, startScale + diff / 300));
      setScale(newScale);
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleSaveAsImage = async () => {
    if (!captureRef.current) return;

    const handle = captureRef.current.querySelector(
      ".resize-handle"
    ) as HTMLElement;
    if (handle) handle.style.display = "none";

    const canvas = await html2canvas(captureRef.current, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
    });

    if (handle) handle.style.display = "block";

    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = `${year}-${month}_calendar.png`;
    link.click();
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <div
        style={{
          padding: "1rem",
          display: "flex",
          gap: "1rem",
          alignItems: "center",
        }}
      >
        <label>
          연도:
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
          />
        </label>
        <label>
          월:
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
          >
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}월
              </option>
            ))}
          </select>
        </label>
        <button onClick={handleAddCalendar}>달력 추가하기</button>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          달력 배경:
          <input
            type="range"
            min="0.2"
            max="1"
            step="0.1"
            value={calendarBgOpacity}
            onChange={(e) => setCalendarBgOpacity(parseFloat(e.target.value))}
          />
          <span>{calendarBgOpacity}</span>
        </label>
        <button onClick={handleSaveAsImage}>이미지로 저장</button>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          width: "100%",
          height: "calc(100vh - 70px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          background: "#f0f0f0",
        }}
      >
        {imageUrl ? (
          <div
            ref={captureRef}
            style={{
              position: "relative",
              display: "inline-block",
            }}
          >
            <img
              src={imageUrl}
              alt="Uploaded"
              style={{
                display: "block",
                maxWidth: "800px",
                maxHeight: "1000px",
                width: "100%",
                height: "auto",
                objectFit: "contain",
              }}
            />
            {calendarData && (
              <div
                ref={calendarWrapperRef}
                onMouseDown={handleMouseDown}
                style={{
                  position: "absolute",
                  top: position.y,
                  left: position.x,
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                  cursor: "move",
                }}
              >
                <StyledCalendar
                  year={year}
                  month={month}
                  calendarData={calendarData}
                  opacity={calendarBgOpacity}
                />
                <div
                  className="resize-handle"
                  onMouseDown={handleResizeStart}
                  style={{
                    position: "absolute",
                    width: "16px",
                    height: "16px",
                    bottom: "-8px",
                    right: "-8px",
                    cursor: "nwse-resize",
                    backgroundColor: "rgba(255, 255, 255, 0.6)",
                    borderRadius: "3px",
                    zIndex: 100,
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              width: "60%",
              height: "60%",
              border: "2px dashed #aaa",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#777",
              fontSize: "1.2rem",
              textAlign: "center",
            }}
          >
            이미지를 드래그하거나 Ctrl + V로 붙여넣기
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
