import { db } from "../firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

export async function reservarSala(
  salaId: string,
  funcionario: string,
  inicio: Date,
  fim: Date
): Promise<string> {
  // Busca reservas da mesma sala
  const reservasRef = collection(db, "reservas");
  const q = query(reservasRef, where("salaId", "==", salaId));
  const snapshot = await getDocs(q);

  const conflito = snapshot.docs.some((doc) => {
    const data = doc.data();
    const rInicio =
      data.inicio && typeof data.inicio.toDate === "function"
        ? data.inicio.toDate()
        : new Date(data.inicio);
    const rFim =
      data.fim && typeof data.fim.toDate === "function"
        ? data.fim.toDate()
        : new Date(data.fim);
    // Overlap if start < existingEnd && end > existingStart
    return inicio < rFim && fim > rInicio;
  });

  if (conflito) return "Horário já reservado.";

  // Verifica se o mesmo funcionário já tem reserva em outro local no mesmo horário
  try {
    const funcRef = collection(db, "reservas");
    const funcQ = query(funcRef, where("funcionario", "==", funcionario));
    const funcSnap = await getDocs(funcQ);
    const conflitoFunc = funcSnap.docs.some((doc) => {
      const data = doc.data();
      const rInicio =
        data.inicio && typeof data.inicio.toDate === "function"
          ? data.inicio.toDate()
          : new Date(data.inicio);
      const rFim =
        data.fim && typeof data.fim.toDate === "function"
          ? data.fim.toDate()
          : new Date(data.fim);
      return inicio < rFim && fim > rInicio;
    });

    if (conflitoFunc) return "O profissional já possui reserva nesse horário.";
  } catch (err) {
    console.warn("Erro ao verificar conflito por profissional:", err);
  }

  // Cria nova reserva
  await addDoc(reservasRef, {
    salaId,
    funcionario,
    inicio,
    fim,
  });

  return "Reserva feita com sucesso!";
}

export async function listarProfissionais(): Promise<string[]> {
  try {
    const ref = collection(db, "profissionais");
    const snap = await getDocs(ref);
    if (!snap || snap.docs.length === 0) return [];
    return snap.docs.map((d) => {
      const data = d.data() as any;
      return data.nome || d.id;
    });
  } catch (err) {
    console.warn("Erro ao listar profissionais:", err);
    return [];
  }
}
