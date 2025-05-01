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

  const captureRef = useRef<HTMLDivElement>(null);

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
      x: window.innerWidth / 2 - 180,
      y: window.innerHeight / 2 - 150,
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

  const handleSaveAsImage = async () => {
    if (!captureRef.current) return;

    // 리사이즈 핸들 숨기기
    const handle = captureRef.current.querySelector(
      ".resize-handle"
    ) as HTMLElement;
    if (handle) handle.style.display = "none";

    // 캡처
    const canvas = await html2canvas(captureRef.current);
    const image = canvas.toDataURL("image/png");

    // 다시 핸들 보이기
    if (handle) handle.style.display = "block";

    // 다운로드
    const link = document.createElement("a");
    link.href = image;
    link.download = `${year}-${month}_calendar.png`;
    link.click();
  };

  const [scale, setScale] = useState(1); // 크기 비율 상태
  const calendarWrapperRef = useRef<HTMLDivElement>(null);

  // 크기 조절 드래그 시작
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startScale = scale;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const diff = moveEvent.clientX - startX;
      const newScale = Math.max(0.5, Math.min(2, startScale + diff / 300)); // 최소 0.5 ~ 최대 2배
      setScale(newScale);
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      {/* 상단 컨트롤 */}
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

        {/* 배경 투명도 */}
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

      {/* 이미지 + 달력 렌더링 */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        ref={captureRef}
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
          <>
            <img
              src={imageUrl}
              alt="Uploaded"
              style={{
                maxWidth: "80%",
                maxHeight: "80%",
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
                  cursor: "move",
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                }}
              >
                <StyledCalendar
                  year={year}
                  month={month}
                  calendarData={calendarData}
                  opacity={calendarBgOpacity}
                />

                {/* 크기 조절 핸들 */}
                <div
                  className="resize-handle" // 👈 이걸 추가
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
          </>
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
