// Engineering & Data templates (part 2 of 3).
// Combined registry and lookup live in src/components/templates.js.
export const TEMPLATES = [
  {
    id: "tcp-packet-bytefield",
    title: "TCP/IP Protocol Header (Packet Bytefield)",
    category: "Engineering & Data",
    kind: "packet",
    description: "Transmission Control Protocol (TCP) 32-bit word packet structure with port numbers, sequence flags, window size, and checksum fields.",
    code: `packet-beta
    0-15: "Source Port"
    16-31: "Destination Port"
    32-63: "Sequence Number"
    64-95: "Acknowledgment Number"
    96-99: "Data Offset"
    100-105: "Reserved"
    106: "URG"
    107: "ACK"
    108: "PSH"
    109: "RST"
    110: "SYN"
    111: "FIN"
    112-127: "Window Size"
    128-143: "Checksum"
    144-159: "Urgent Pointer"
    160-191: "Options & Padding"
`,
  },
];
