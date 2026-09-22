import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { workshopConfig } from "@/config/workshop";

const { sendMock } = vi.hoisted(() => ({ sendMock: vi.fn() }));

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: sendMock };
  },
}));

import { POST } from "@/app/api/send-phase-result/route";

const SESSION_ID = "123e4567-e89b-42d3-a456-426614174000";
const phase = workshopConfig.phases[0];
const cards = workshopConfig.cards.filter((card) => card.phaseId === phase.id).slice(0, 3);
const validPayload = { sessionId: SESSION_ID, phaseId: phase.id, selectedCardIds: cards.map((card) => card.id) };

function request(payload: unknown) {
  return new Request("http://localhost/api/send-phase-result", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

describe("POST /api/send-phase-result", () => {
  beforeEach(() => {
    vi.stubEnv("RESEND_API_KEY", "test_api_key");
    vi.stubEnv("RESEND_FROM_EMAIL", "Justicia 2030 <resultados@example.com>");
    vi.stubEnv("RESULTS_EMAIL_TO", "uno@example.com, dos@example.com");
    vi.stubEnv("RESULTS_REPLY_TO", "respuesta@example.com");
    sendMock.mockReset();
    sendMock.mockResolvedValue({ data: { id: "mock-id" }, error: null });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("envía una sola operación a todos los destinatarios con idempotencia", async () => {
    const response = await POST(request(validPayload));
    expect(response.status).toBe(200);
    expect(sendMock).toHaveBeenCalledOnce();
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "Justicia 2030 <resultados@example.com>",
        to: ["uno@example.com", "dos@example.com"],
        replyTo: "respuesta@example.com",
        subject: `Justicia 2030 · ${phase.name}`,
      }),
      { idempotencyKey: expect.stringMatching(/^justicia2030-phase-result-[0-9a-f]{64}$/) },
    );
  });

  it("no permite que campos controlados por cliente alteren el correo", async () => {
    await POST(request({
      ...validPayload,
      to: "ataque@example.com",
      from: "ataque@example.com",
      subject: "Ataque",
      text: "Ataque",
      collectiveId: "colectivo",
      profileId: "perfil",
    }));
    const [email] = sendMock.mock.calls[0];
    expect(email.to).toEqual(["uno@example.com", "dos@example.com"]);
    expect(email.from).toBe("Justicia 2030 <resultados@example.com>");
    expect(email.subject).toBe(`Justicia 2030 · ${phase.name}`);
    expect(email.text).not.toContain("Ataque");
    expect(email.text).not.toContain("colectivo");
  });

  it("devuelve 400 y no envía ante payload inválido", async () => {
    const response = await POST(request({ ...validPayload, selectedCardIds: validPayload.selectedCardIds.slice(0, 2) }));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Solicitud no válida." });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("devuelve 500 sin enviar cuando falta configuración", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const response = await POST(request(validPayload));
    expect(response.status).toBe(500);
    expect(sendMock).not.toHaveBeenCalled();
    expect(JSON.stringify(await response.json())).not.toContain("RESEND_API_KEY");
  });

  it("devuelve un error genérico cuando Resend rechaza el envío", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    sendMock.mockResolvedValue({ data: null, error: { message: "provider secret detail" } });
    const response = await POST(request(validPayload));
    expect(response.status).toBe(500);
    const body = JSON.stringify(await response.json());
    expect(body).toBe(JSON.stringify({ error: "No se pudieron enviar los resultados." }));
    expect(body).not.toContain("provider secret detail");
    expect(body).not.toContain("test_api_key");
  });
});
