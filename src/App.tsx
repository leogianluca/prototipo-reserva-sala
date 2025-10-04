import { useState } from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import PlantaBaixa from "./PlantaBaixa";

export default function App() {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [selectedRoomLabel, setSelectedRoomLabel] = useState<string | null>(null);
  const [selectedRoomReservations, setSelectedRoomReservations] = useState(
    [] as Array<{ funcionario?: string | null; inicio?: Date | null; fim?: Date | null }>
  );
  const [externalOpenRoom, setExternalOpenRoom] = useState<string | null>(null);
  const [allReservationsByRoom, setAllReservationsByRoom] = useState({} as Record<string, Array<any>>);
  const [hideEmptyRooms, setHideEmptyRooms] = useState(false);

  const filteredReservationEntries = Object.entries(allReservationsByRoom).filter(([, arr]) =>
    hideEmptyRooms ? (arr || []).length > 0 : true
  );

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "#ffffff", overflow: "hidden" }}>
      <Box sx={{ flex: 1, p: { xs: 1, sm: 2, md: 3 }, minHeight: 0 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" }, // mobile: coluna, desktop: linha
            gap: 3,
            height: "100%",
            minHeight: 0, // important for children with overflow:auto
          }}
        >
          {/* Planta */}
          <Box sx={{ flex: 1, minHeight: { xs: 300, md: 0 }, overflow: 'auto', minWidth: 0 }}>
            <PlantaBaixa
              zoom={zoomLevel}
              externalOpenRoom={externalOpenRoom}
              onRoomSelect={(label, reservations) => {
                setSelectedRoomLabel(label);
                setSelectedRoomReservations(reservations || []);
                setExternalOpenRoom(null);
              }}
              onAllReservationsUpdate={(grouped) => setAllReservationsByRoom(grouped)}
            />
          </Box>

          {/* Sidebar */}
          <Box
            sx={{
              width: { xs: "100%", md: 300 }, // no mobile ocupa toda largura
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              height: { xs: "auto", md: "100%" },
              minHeight: 0,
            }}
          >
            {/* Lista geral com scroll */}
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Título e botão ocupam o espaço necessário */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6">Agendamentos</Typography>
                <Button size="small" onClick={() => setHideEmptyRooms((v) => !v)}>
                  {hideEmptyRooms ? "Mostrar todas" : "Ocultar salas vazias"}
                </Button>
              </Box>

              {/* Lista ocupa o restante do espaço */}
              <Box sx={{ flex: 1, overflowY: "auto", pr: 1 }}>
                {filteredReservationEntries.map(([label, arr]) => (
                  <div key={label} style={{ marginBottom: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                      {label} ({(arr || []).length})
                    </div>
                    <div style={{ paddingLeft: 12, marginTop: 6 }}>
                      {(arr || []).length > 0 ? (
                        <ul style={{ margin: 0, paddingLeft: 16, wordBreak: 'break-word' }}>
                          {(arr || []).map((r: any, i: number) => {
                            const inicio = r.inicio ? new Date(r.inicio) : null;
                            const fim = r.fim ? new Date(r.fim) : null;

                            const formatDate = (d: Date | null) => {
                              if (!d) return "-";
                              const dd = String(d.getDate()).padStart(2, "0");
                              const mm = String(d.getMonth() + 1).padStart(2, "0");
                              const yyyy = d.getFullYear();
                              const hh = String(d.getHours()).padStart(2, "0");
                              return `${dd}/${mm}/${yyyy} ${hh}`;
                            };

                            return (
                              <li key={i} style={{ marginBottom: 6 }}>
                                <b>{formatDate(inicio)}h - {fim ? String(fim.getHours()).padStart(2, "0") : "-"}h</b>
                                <br />
                                {r.funcionario || "Sem nome"}
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Sem agendamentos
                        </Typography>
                      )}
                    </div>
                  </div>
                ))}
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
