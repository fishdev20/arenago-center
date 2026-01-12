"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Booking = {
  id: string;
  date: string;
  time: string;
  customer: string;
  field: string;
  status: "confirmed" | "cancelled" | "completed";
  price: string;
};

const MOCK_BOOKINGS: Booking[] = [
  {
    id: "1",
    date: "2026-01-12",
    time: "09:00–10:30",
    customer: "Minh Nguyen",
    field: "Court 1",
    status: "confirmed",
    price: "€30",
  },
  {
    id: "2",
    date: "2026-01-12",
    time: "12:00–13:00",
    customer: "Anna",
    field: "Court 2",
    status: "completed",
    price: "€25",
  },
  {
    id: "3",
    date: "2026-01-13",
    time: "18:00–19:00",
    customer: "John",
    field: "Court 1",
    status: "cancelled",
    price: "€0",
  },
];

function statusVariant(status: Booking["status"]) {
  if (status === "confirmed") return "default";
  if (status === "completed") return "secondary";
  return "outline";
}

export default function BookingsTable() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Field</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Price</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {MOCK_BOOKINGS.map((b) => (
            <TableRow key={b.id}>
              <TableCell>
                <div className="font-medium">{b.date}</div>
                <div className="text-xs text-muted-foreground">{b.time}</div>
              </TableCell>

              <TableCell>{b.customer}</TableCell>
              <TableCell>{b.field}</TableCell>

              <TableCell>
                <Badge variant={statusVariant(b.status)}>{b.status}</Badge>
              </TableCell>

              <TableCell>{b.price}</TableCell>

              <TableCell className="text-right">
                <Button variant="outline" size="sm">
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
