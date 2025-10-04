// SalaReservavel.jsx
import React, { useState } from 'react';

const SalaReservavel = ({
  salaId,
  x, y, width, height, label,
  onReservaClick, // Mudei o nome para indicar que é só o clique
  status, reservadoPor
}) => {
  // Cores base
  const colorPrimary = '#5C2D91'; // Padrão
  const colorReserved = '#FF5C5C'; // Vermelho (Reservado)

  // Cor condicional baseada no status
  const currentFill = status === 'RESERVADA' ? colorReserved : colorPrimary;

  const [showDetails, setShowDetails] = useState(false);

  const handleClick = () => {
    // Se a sala estiver reservada, exibe/esconde os detalhes
    if (status === 'RESERVADA') {
      setShowDetails(!showDetails);
    }
    // Se estiver disponível, chama a função do pai para iniciar o fluxo de reserva
    else {
      onReservaClick(salaId);
    }
  };

  // --- Renderização da Sala ---
  return (
    <g onClick={handleClick} style={{ cursor: 'pointer' }}>
      {/* Bloco principal da sala (cor muda aqui) */}
      <rect x={x} y={y} width={width} height={height} rx={8} fill={currentFill} />
      <text
        x={x + width / 2}
        y={y + height / 2 + 4}
        textAnchor="middle"
        fontSize={12}
        fill="white"
        fontWeight="bold"
      >
        {label}
      </text>

      {/* Overlay/Pop-up de Detalhes da Reserva */}
      {showDetails && status === 'RESERVADA' && (
        <foreignObject x={x} y={y} width={width} height={height}>
          <div style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '5px',
            borderRadius: '8px',
            textAlign: 'center',
            fontSize: '10px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}>
            <p style={{ margin: 0, fontWeight: 'bold' }}>RESERVADA!</p>
            <p style={{ margin: 0 }}>Por: {reservadoPor}</p>
            <p style={{ margin: 0 }}>Clique para fechar.</p>
          </div>
        </foreignObject>
      )}
    </g>
  );
};

export default SalaReservavel;