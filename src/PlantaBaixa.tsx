import { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { reservarSala, listarProfissionais } from "./services/ReservaService";
import { db } from "./firebase";
import { collection, onSnapshot } from "firebase/firestore";

interface Room {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

interface PlantaProps {
  zoom?: number;
  onRoomSelect?: (
    label: string,
    reservations: Array<{
      funcionario?: string | null;
      inicio?: Date | null;
      fim?: Date | null;
    }>
  ) => void;
  externalOpenRoom?: string | null;
  onAllReservationsUpdate?: (grouped: Record<string, Array<any>>) => void;
}

const PlantaBaixaSimetricaAjustada = ({
  onRoomSelect,
  externalOpenRoom,
  onAllReservationsUpdate,
}: PlantaProps) => {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [hoveredRoom, setHoveredRoom] = useState<Room | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const [selectedDay, setSelectedDay] = useState<Dayjs>(dayjs());
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [funcionario, setFuncionario] = useState("");
  const [funcionariosList, setFuncionariosList] = useState<string[]>([]);
  const [reservationStatus, setReservationStatus] = useState("");
  const [availability, setAvailability] = useState<Record<string, boolean>>({});
  const [reservationsByRoom, setReservationsByRoom] = useState<Record<string, Array<any>>>({});

  const viewBoxString = "0 0 800 750";
  const pastelGreen = "#80ef80";

  const overlaps = (aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) => {
    return aStart.getTime() < bEnd.getTime() && aEnd.getTime() > bStart.getTime();
  };

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
    const reservations = reservationsByRoom[room.label] || [];
    if (onRoomSelect) onRoomSelect(room.label, reservations);
    if (isMobile) setMobileDrawerOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedRoom(null);
    setReservationStatus("");
    setMobileDrawerOpen(false);
  };

  const handleReservation = async () => {
    if (!selectedRoom || !funcionario) return;
    if (selectedHour === null) {
      setReservationStatus("Selecione um horário.");
      return;
    }

    const slotStart = selectedDay.hour(selectedHour).minute(0).second(0).toDate();
    const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);

    const existing = (reservationsByRoom[selectedRoom.label] || []).some((r: any) => {
      if (!r.inicio || !r.fim) return false;
      const ri = new Date(r.inicio);
      const rf = new Date(r.fim);
      return overlaps(slotStart, slotEnd, ri, rf);
    });

    if (existing) {
      setReservationStatus("Horário já reservado (conflito).");
      return;
    }

    const funcionarioConflict = funcionario
      ? Object.values(reservationsByRoom).some((arr) =>
        arr.some((r: any) => {
          if (!r.inicio || !r.fim || !r.funcionario) return false;
          if (r.funcionario !== funcionario) return false;
          const ri = new Date(r.inicio);
          const rf = new Date(r.fim);
          return overlaps(slotStart, slotEnd, ri, rf);
        })
      )
      : false;

    if (funcionarioConflict) {
      setReservationStatus("O profissional já possui reserva nesse horário.");
      return;
    }

    const result = await reservarSala(selectedRoom.label, funcionario, slotStart, slotEnd);
    setReservationStatus(result);
    if (result === "Reserva feita com sucesso!") {
      setTimeout(handleCloseModal, 2000);
    }
  };

  interface SalaBlockProps {
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    fontSize?: number;
    fill?: string;
  }

  const SalaBlock = ({ x, y, width, height, label, fontSize = 10, fill = "#7C7C7C" }: SalaBlockProps) => (
    <g
      onClick={() => handleRoomClick({ x, y, width, height, label })}
      onMouseEnter={() => setHoveredRoom({ x, y, width, height, label })}
      onMouseLeave={() => setHoveredRoom(null)}
      style={{ cursor: "pointer" }}
    >
      <rect x={x} y={y} width={width} height={height} rx={8} fill={hoveredRoom?.label === label ? "#BFBFBF" : fill} />
      <text
        x={x + width / 2}
        y={y + height / 2 + fontSize / 3}
        textAnchor="middle"
        fontSize={Math.max(8, Math.min(12, fontSize))}
        fill="white"
        fontWeight="bold"
      >
        {label}
      </text>
    </g>
  );

  const roomLayout = [
    { x: 50, y: 60, width: 220, height: 90, label: "Sala 1" },
    { x: 290, y: 60, width: 220, height: 90, label: "Sala 2" },
    { x: 530, y: 60, width: 220, height: 90, label: "Sala 3" },
    { x: 50, y: 170, width: 140, height: 90, label: "Sala 4" },
    { x: 210, y: 170, width: 140, height: 90, label: "Sala 5" },
    { x: 50, y: 280, width: 140, height: 90, label: "Sala 6" },
    { x: 210, y: 280, width: 140, height: 90, label: "Sala 7" },
    { x: 370, y: 280, width: 140, height: 90, label: "Sala 8" },
    { x: 530, y: 280, width: 140, height: 90, label: "Sala 9" },
    { x: 490, y: 390, width: 260, height: 140, label: "Sala 10 / Espaço" },
    { x: 50, y: 550, width: 140, height: 90, label: "Sala 11" },
    { x: 210, y: 550, width: 140, height: 90, label: "Sala 12" },
    { x: 370, y: 550, width: 140, height: 90, label: "Sala 13" },
    { x: 690, y: 170, width: 60, height: 90, label: "Sala 14" },
    { x: 690, y: 280, width: 60, height: 90, label: "Sala 15" },
    { x: 370, y: 170, width: 140, height: 90, label: "JARDIM" },
    { x: 530, y: 170, width: 140, height: 90, label: "Aquário" },
    { x: 50, y: 390, width: 420, height: 140, label: "Salão Sensorial" },
  ];

  // 🔹 Aqui entra a escuta em tempo real
  useEffect(() => {
    const reservasRef = collection(db, "reservas");

    const unsub = onSnapshot(reservasRef, (snapshot) => {
      const now = new Date();
      const reservas = snapshot.docs.map((d) => {
        const data = d.data() as any;
        const inicio =
          data.inicio && typeof data.inicio.toDate === "function" ? data.inicio.toDate() : new Date(data.inicio);
        const fim = data.fim && typeof data.fim.toDate === "function" ? data.fim.toDate() : new Date(data.fim);
        return { salaId: data.salaId, inicio, fim, funcionario: data.funcionario || null };
      });

      const map: Record<string, boolean> = {};
      const grouped: Record<string, Array<any>> = {};
      roomLayout.forEach((r) => {
        const related = reservas.filter((res) => res.salaId === r.label);
        grouped[r.label] = related;

        const conflicted = related.some((res) => {
          if (!res.inicio || !res.fim) return false;
          return now >= res.inicio && now < res.fim;
        });
        map[r.label] = !conflicted;
      });

      setAvailability(map);
      setReservationsByRoom(grouped);
      if (onAllReservationsUpdate) onAllReservationsUpdate(grouped);
    });

    return () => unsub();
  }, []);

  // 🔹 Carregar lista de funcionários
  useEffect(() => {
    listarProfissionais().then((list) => {
      setFuncionariosList(list.length > 0 ? list : ["Ana", "Bruno", "Camila"]);
    });
  }, []);

  return (
    <div style={{ width: "100%", justifyContent: "center", overflow: "hidden" }}>
      <svg width="100%" height="100%" viewBox={viewBoxString} preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
        {roomLayout.map((room, index) => (
          <SalaBlock
            key={index}
            x={room.x}
            y={room.y}
            width={room.width}
            height={room.height}
            label={room.label}
            fill={availability[room.label] ? pastelGreen : "#7C7C7C"}
          />
        ))}
      </svg>

      <Dialog open={!!selectedRoom} onClose={handleCloseModal} fullScreen={isMobile}>
        <DialogTitle>Reservar {selectedRoom?.label}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="subtitle1">Profissional</Typography>
          <TextField select value={funcionario} onChange={(e) => setFuncionario(e.target.value)} SelectProps={{ native: true }}>
            <option value=""></option>
            {funcionariosList.map((f, i) => (
              <option key={i} value={f}>
                {f}
              </option>
            ))}
          </TextField>

          <Typography variant="subtitle1">Data</Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker value={selectedDay} onChange={(newValue) => newValue && setSelectedDay(newValue)} />
          </LocalizationProvider>

          <Typography variant="subtitle1">Horários</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {[8, 9, 10, 11, 14, 15, 16, 17].map((hour) => (
              <Button key={hour} variant={selectedHour === hour ? "contained" : "outlined"} onClick={() => setSelectedHour(hour)}>
                {hour}:00
              </Button>
            ))}
          </Box>

          {reservationStatus && (
            <Typography variant="body2" color="error">
              {reservationStatus}
            </Typography>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button onClick={handleReservation} variant="contained" disabled={!funcionario || selectedHour === null}>
            Reservar
          </Button>
        </DialogActions>
      </Dialog>
    </div >
  );
};

export default PlantaBaixaSimetricaAjustada;
