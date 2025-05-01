import React from "react";

interface StyledCalendarProps {
  year: number;
  month: number;
  calendarData: number[][];
  opacity: number;
}

const daysKo = ["일", "월", "화", "수", "목", "금", "토"];
const daysEn = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const monthEn = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const StyledCalendar: React.FC<StyledCalendarProps> = ({
  year,
  month,
  calendarData,
  opacity,
}) => {
  return (
    <div
      style={{
        width: "300px",
        backgroundColor: `rgba(17, 17, 17, ${opacity})`,
        color: "#fff",
        padding: "1rem",
        borderRadius: "16px",
        boxShadow: "0 8px 16px rgba(0,0,0,0.3)",
        border: "2px solid #444",
        fontFamily: `'Spoqa Han Sans Neo', sans-serif`,
        textAlign: "center",
      }}
    >
      {/* 헤더: 월 숫자 + 영문 월 + 연도 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: "0.1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.2rem" }}>
          <span
            style={{
              fontSize: "3rem",
              fontFamily: `'Spoqa Han Sans Neo', sans-serif`,
            }}
          >
            {month}
          </span>
          <span
            style={{
              fontSize: "0.8rem",
              color: "#ccc",
              fontFamily: `'Orbitron', sans-serif`,
            }}
          >
            {monthEn[month].toUpperCase()}
          </span>
        </div>
        <div style={{ fontSize: "0.8rem", color: "#aaa" }}>{`${year}년`}</div>
      </div>

      {/* 요일 헤더 */}
      <div
        style={{
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          padding: "0.3rem 0",
          marginBottom: "0.3rem",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
          }}
        >
          {daysKo.map((ko, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  color: idx === 0 || idx === 6 ? "#FFD700" : "#ccc",
                  fontSize: "0.95rem",
                  fontFamily: `'Spoqa Han Sans Neo', sans-serif`,
                }}
              >
                {ko}
              </div>
              <div
                style={{
                  fontSize: "0.3rem",
                  backgroundColor: "#fff",
                  color: "#000",
                  padding: "2px 4px",
                  borderRadius: "4px",
                  marginTop: "1px",
                  fontWeight: 600,
                  fontFamily: `'Orbitron', sans-serif`,
                  letterSpacing: "0.5px",
                }}
              >
                {daysEn[idx]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 날짜 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "0.25rem",
        }}
      >
        {calendarData.flat().map((day, idx) => {
          const col = idx % 7;
          const isSunday = col === 0;
          const isSaturday = col === 6;

          return (
            <div
              key={idx}
              style={{
                color:
                  day === 0
                    ? "transparent"
                    : isSunday
                    ? "#FFD700"
                    : isSaturday
                    ? "#66f"
                    : "#eee",
                fontFamily: `'Spoqa Han Sans Neo', sans-serif`,
              }}
            >
              {day === 0 ? "" : day}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StyledCalendar;
