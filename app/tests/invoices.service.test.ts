const mockPrisma = {
  project: {
    findFirst: jest.fn(),
  },
  estimate: {
    findFirst: jest.fn(),
  },
  proposal: {
    findFirst: jest.fn(),
  },
  invoice: {
    aggregate: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
  invoiceDelivery: {
    create: jest.fn(),
  },
};

jest.mock("../db/client", () => ({ prisma: mockPrisma }));
jest.mock("../modules/intelligence/service", () => ({
  ActivityTimelineService: jest.fn().mockImplementation(() => ({
    record: jest.fn().mockResolvedValue(undefined),
  })),
}));

import { InvoicesService } from "../modules/invoices/service";

describe("InvoicesService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a full invoice from custom line items and numbers it sequentially", async () => {
    mockPrisma.project.findFirst.mockResolvedValue({ id: "project-1", orgId: "org-1" });
    mockPrisma.invoice.aggregate.mockResolvedValue({ _max: { invoiceNumber: 1 } });
    mockPrisma.invoice.create.mockResolvedValue({
      id: "invoice-1",
      projectId: "project-1",
      estimateId: null,
      proposalId: null,
      invoiceNumber: 2,
      type: "full",
      status: "draft",
      percentComplete: null,
      amount: 500,
      dueDate: null,
      sentAt: null,
      paidAt: null,
      createdAt: new Date(),
    });
    mockPrisma.invoice.findFirst.mockResolvedValue({
      id: "invoice-1",
      projectId: "project-1",
      estimateId: null,
      proposalId: null,
      invoiceNumber: 2,
      type: "full",
      status: "draft",
      percentComplete: null,
      amount: 500,
      dueDate: null,
      sentAt: null,
      paidAt: null,
      createdAt: new Date(),
      lineItems: [{ id: "li-1", description: "Concrete pour", quantity: 10, unitOfMeasure: "sqft", unitCost: 50, lineCost: 500, sortOrder: 0 }],
      deliveries: [{ id: "delivery-1", eventType: "invoice.created", deliveryChannel: "app", recipientEmail: null, actorUserId: "user-1", metadataJson: { amount: 500 }, occurredAt: new Date(), createdAt: new Date() }],
    });

    const service = new InvoicesService();
    const invoice = await service.create({
      orgId: "org-1",
      actorUserId: "user-1",
      projectId: "project-1",
      lineItems: [{ description: "Concrete pour", quantity: 10, unitOfMeasure: "sqft", unitCost: 50 }],
    });

    expect(invoice.invoiceNumber).toBe(2);
    expect(invoice.deliveries[0]?.eventType).toBe("invoice.created");
    expect(mockPrisma.invoice.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ invoiceNumber: 2, amount: 500 }) })
    );
    expect(mockPrisma.invoiceDelivery.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ eventType: "invoice.created", actorUserId: "user-1" }) })
    );
  });

  it("scales line items from an estimate for a progress invoice", async () => {
    mockPrisma.project.findFirst.mockResolvedValue({ id: "project-1", orgId: "org-1" });
    mockPrisma.estimate.findFirst.mockResolvedValue({
      id: "estimate-1",
      projectId: "project-1",
      lineItems: [{ description: "Driveway", quantity: 100, unitOfMeasure: "sqft", unitCost: 10 }],
    });
    mockPrisma.invoice.aggregate.mockResolvedValue({ _max: { invoiceNumber: null } });
    mockPrisma.invoice.create.mockResolvedValue({
      id: "invoice-1",
      projectId: "project-1",
      estimateId: "estimate-1",
      proposalId: null,
      invoiceNumber: 1,
      type: "progress",
      status: "draft",
      percentComplete: 50,
      amount: 500,
      dueDate: null,
      sentAt: null,
      paidAt: null,
      createdAt: new Date(),
    });
    mockPrisma.invoice.findFirst.mockResolvedValue({
      id: "invoice-1",
      projectId: "project-1",
      estimateId: "estimate-1",
      proposalId: null,
      invoiceNumber: 1,
      type: "progress",
      status: "draft",
      percentComplete: 50,
      amount: 500,
      dueDate: null,
      sentAt: null,
      paidAt: null,
      createdAt: new Date(),
      lineItems: [{ id: "li-1", description: "Driveway", quantity: 50, unitOfMeasure: "sqft", unitCost: 10, lineCost: 500, sortOrder: 0 }],
      deliveries: [],
    });

    const service = new InvoicesService();
    await service.create({ orgId: "org-1", projectId: "project-1", estimateId: "estimate-1", type: "progress", percentComplete: 50 });

    expect(mockPrisma.invoice.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          lineItems: { create: [expect.objectContaining({ quantity: 50, lineCost: 500 })] },
        }),
      })
    );
  });

  it("rejects a progress invoice without percentComplete", async () => {
    mockPrisma.project.findFirst.mockResolvedValue({ id: "project-1", orgId: "org-1" });

    const service = new InvoicesService();
    await expect(
      service.create({ orgId: "org-1", projectId: "project-1", estimateId: "estimate-1", type: "progress" })
    ).rejects.toThrow("percentComplete");
  });

  it("marks a sent invoice paid", async () => {
    mockPrisma.invoice.findFirst
      .mockResolvedValueOnce({
        id: "invoice-1",
        projectId: "project-1",
        status: "sent",
        invoiceNumber: 1,
        project: { orgId: "org-1", customer: { email: "billing@example.com" } },
        deliveries: [],
      })
      .mockResolvedValueOnce({
        id: "invoice-1",
        projectId: "project-1",
        estimateId: null,
        proposalId: null,
        invoiceNumber: 1,
        type: "full",
        status: "paid",
        percentComplete: null,
        amount: 500,
        dueDate: null,
        sentAt: new Date(),
        paidAt: new Date(),
        createdAt: new Date(),
        lineItems: [],
        deliveries: [{ id: "delivery-1", eventType: "invoice.paid", deliveryChannel: "app", recipientEmail: "billing@example.com", actorUserId: "user-1", metadataJson: null, occurredAt: new Date(), createdAt: new Date() }],
      });
    mockPrisma.invoice.update.mockResolvedValue({
      id: "invoice-1",
      projectId: "project-1",
      estimateId: null,
      proposalId: null,
      invoiceNumber: 1,
      type: "full",
      status: "paid",
      percentComplete: null,
      amount: 500,
      dueDate: null,
      sentAt: new Date(),
      paidAt: new Date(),
      createdAt: new Date(),
    });

    const service = new InvoicesService();
    const invoice = await service.markPaid("invoice-1", "org-1", "user-1");

    expect(invoice.status).toBe("paid");
    expect(mockPrisma.invoiceDelivery.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ eventType: "invoice.paid", actorUserId: "user-1" }) })
    );
  });

  it("rejects voiding a paid invoice", async () => {
    mockPrisma.invoice.findFirst.mockResolvedValue({
      id: "invoice-1",
      projectId: "project-1",
      status: "paid",
      project: { orgId: "org-1", customer: { email: "billing@example.com" } },
      deliveries: [],
    });

    const service = new InvoicesService();
    await expect(service.void("invoice-1", "org-1")).rejects.toThrow("already been paid");
  });

  it("returns line items with the invoice on getById", async () => {
    mockPrisma.invoice.findFirst.mockResolvedValue({
      id: "invoice-1",
      projectId: "project-1",
      estimateId: null,
      proposalId: null,
      invoiceNumber: 1,
      type: "full",
      status: "draft",
      percentComplete: null,
      amount: 500,
      dueDate: null,
      sentAt: null,
      paidAt: null,
      createdAt: new Date(),
      lineItems: [
        { id: "li-1", description: "Concrete pour", quantity: 10, unitOfMeasure: "sqft", unitCost: 50, lineCost: 500, sortOrder: 0 },
      ],
      deliveries: [{ id: "delivery-1", eventType: "invoice.created", deliveryChannel: "app", recipientEmail: null, actorUserId: null, metadataJson: null, occurredAt: new Date(), createdAt: new Date() }],
    });

    const service = new InvoicesService();
    const invoice = await service.getById("invoice-1", "org-1");

    expect(invoice.lineItems).toHaveLength(1);
    expect(invoice.lineItems[0]).toMatchObject({ description: "Concrete pour", quantity: 10, lineCost: 500 });
    expect(invoice.deliveries[0]?.eventType).toBe("invoice.created");
  });
});
