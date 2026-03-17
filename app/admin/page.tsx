"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  RefreshCw,
  Search,
  Filter,
  Download,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  ExternalLink,
  Users,
  Wallet,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  Lock,
  ShieldAlert,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePiSDK } from "@/hooks/use-pi-sdk";

// Admin wallet address - only this address can access admin panel
const ADMIN_WALLET_ADDRESS = "GAIEJAHECAU4IR3QZ2KPCDJDL5WGLBWZRF4QQ4RTTZ5AIVQ74SVFHEU5";

// Types
interface Order {
  id: string;
  user_uid: string;
  username: string;
  amount_pi: number;
  phone_number: string;
  network_provider: string;
  data_plan: string;
  status: "pending" | "completed" | "failed";
  txid: string;
  payment_id: string;
  created_at: string;
  completed_at?: string;
  delivery_id?: string;
}

// Sample orders data (in production, fetch from backend)
const initialOrders: Order[] = [
  {
    id: "order_001",
    user_uid: "user_pi_abc123def456ghi789jkl012mno345pqr678stu901vwx234",
    username: "PiPioneer2024",
    amount_pi: 0.9,
    phone_number: "08012345678",
    network_provider: "MTN",
    data_plan: "1GB",
    status: "completed",
    txid: "abc123def456abc123def456abc123def456abc123def456abc123def456abc1",
    payment_id: "pay_abc123",
    created_at: new Date(Date.now() - 3600000).toISOString(),
    completed_at: new Date(Date.now() - 3500000).toISOString(),
    delivery_id: "VTU_1710000001_ABC123",
  },
  {
    id: "order_002",
    user_uid: "user_pi_xyz789ghi012jkl345mno678pqr901stu234vwx567yza890",
    username: "DataMaster_NG",
    amount_pi: 1.7,
    phone_number: "09098765432",
    network_provider: "Airtel",
    data_plan: "2GB",
    status: "pending",
    txid: "xyz789ghi012xyz789ghi012xyz789ghi012xyz789ghi012xyz789ghi012xyz7",
    payment_id: "pay_xyz789",
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "order_003",
    user_uid: "user_pi_mno345pqr678stu901vwx234yza567bcd890efg123hij456",
    username: "TechSavvy101",
    amount_pi: 0.5,
    phone_number: "07011112222",
    network_provider: "Glo",
    data_plan: "500MB",
    status: "pending",
    txid: "mno345pqr678mno345pqr678mno345pqr678mno345pqr678mno345pqr678mno3",
    payment_id: "pay_mno345",
    created_at: new Date(Date.now() - 900000).toISOString(),
  },
  {
    id: "order_004",
    user_uid: "user_pi_qrs567tuv890wxy123zab456cde789fgh012ijk345lmn678",
    username: "MobilePioneer",
    amount_pi: 4.0,
    phone_number: "08033334444",
    network_provider: "9mobile",
    data_plan: "5GB",
    status: "completed",
    txid: "qrs567tuv890qrs567tuv890qrs567tuv890qrs567tuv890qrs567tuv890qrs5",
    payment_id: "pay_qrs567",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    completed_at: new Date(Date.now() - 86300000).toISOString(),
    delivery_id: "VTU_1710000004_QRS567",
  },
  {
    id: "order_005",
    user_uid: "user_pi_efg890hij123klm456nop789qrs012tuv345wxy678zab901",
    username: "PiNetwork_Fan",
    amount_pi: 0.9,
    phone_number: "09055556666",
    network_provider: "MTN",
    data_plan: "1GB",
    status: "failed",
    txid: "efg890hij123efg890hij123efg890hij123efg890hij123efg890hij123efg8",
    payment_id: "pay_efg890",
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

// Stats Card Component
function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendUp,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
}) {
  return (
    <div className="rounded-xl bg-card p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
      {trend && (
        <div className="mt-2 flex items-center gap-1">
          <TrendingUp
            className={cn(
              "h-3 w-3",
              trendUp ? "text-success" : "text-destructive rotate-180"
            )}
          />
          <span
            className={cn(
              "text-xs font-medium",
              trendUp ? "text-success" : "text-destructive"
            )}
          >
            {trend}
          </span>
          <span className="text-xs text-muted-foreground">vs last week</span>
        </div>
      )}
    </div>
  );
}

// Admin Login Component
function AdminLogin({
  onLogin,
  error,
  isLoading,
}: {
  onLogin: (password: string) => void;
  error: string | null;
  isLoading: boolean;
}) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(password);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        {/* Lock Icon */}
        <div className="mb-8 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-10 w-10 text-primary" />
          </div>
        </div>

        <h1 className="mb-2 text-center text-2xl font-bold text-foreground">
          Admin Access
        </h1>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          Enter your admin password to continue
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin Password"
              className="h-12 w-full rounded-xl bg-card px-4 pr-12 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading || !password}
            className={cn(
              "w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition-colors",
              "hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            {isLoading ? "Authenticating..." : "Access Admin Panel"}
          </button>
        </form>

        <Link
          href="/"
          className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

// Access Denied Component
function AccessDenied({ walletAddress }: { walletAddress?: string | null }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm text-center">
        <div className="mb-8 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
            <ShieldAlert className="h-10 w-10 text-destructive" />
          </div>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-foreground">
          Access Denied
        </h1>
        <p className="mb-4 text-sm text-muted-foreground">
          Your wallet address is not authorized to access the admin panel.
        </p>

        {walletAddress && (
          <div className="mb-6 rounded-xl bg-card p-4">
            <p className="text-xs text-muted-foreground">Your wallet:</p>
            <p className="mt-1 font-mono text-xs text-foreground break-all">
              {walletAddress}
            </p>
          </div>
        )}

        <Link
          href="/"
          className={cn(
            "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition-colors",
            "hover:bg-primary/90"
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { isAuthenticated, walletAddress } = usePiSDK();
  
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "completed" | "failed"
  >("all");
  const [copied, setCopied] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Check if user's wallet matches admin wallet
  const isAdminWallet = walletAddress === ADMIN_WALLET_ADDRESS;

  // Handle admin login
  const handleAdminLogin = async (password: string) => {
    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, walletAddress }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsAdminAuthenticated(true);
        // Load orders after successful auth
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 1000);
      } else {
        setAuthError(data.error || "Authentication failed");
      }
    } catch (error) {
      console.error("[Admin] Login error:", error);
      setAuthError("Failed to authenticate. Please try again.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Show access denied if wallet doesn't match
  if (!isAdminWallet) {
    return <AccessDenied walletAddress={walletAddress} />;
  }

  // Show login screen if not admin authenticated
  if (!isAdminAuthenticated) {
    return (
      <AdminLogin
        onLogin={handleAdminLogin}
        error={authError}
        isLoading={isAuthenticating}
      />
    );
  }

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.phone_number.includes(searchQuery) ||
      order.user_uid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.txid.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || order.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Stats calculations
  const totalPi = orders.reduce((sum, o) => sum + o.amount_pi, 0);
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const completedOrders = orders.filter((o) => o.status === "completed").length;
  const totalOrders = orders.length;

  // Toggle order status
  const toggleOrderStatus = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const newStatus =
            order.status === "pending" ? "completed" : "pending";
          return {
            ...order,
            status: newStatus,
            completed_at:
              newStatus === "completed" ? new Date().toISOString() : undefined,
            delivery_id:
              newStatus === "completed"
                ? `VTU_${Date.now()}_${order.id.slice(-6).toUpperCase()}`
                : undefined,
          };
        }
        return order;
      })
    );
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(field);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      console.error("Failed to copy");
    }
  };

  // Format helpers
  const formatTxId = (txid: string) =>
    txid.length > 16 ? `${txid.slice(0, 6)}...${txid.slice(-6)}` : txid;

  const formatUid = (uid: string) =>
    uid.length > 20 ? `${uid.slice(0, 10)}...${uid.slice(-8)}` : uid;

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-NG", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Export orders as CSV
  const exportOrders = () => {
    const headers = [
      "Order ID",
      "User UID",
      "Username",
      "Amount (Pi)",
      "Phone",
      "Network",
      "Plan",
      "Status",
      "TXID",
      "Created At",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredOrders.map((o) =>
        [
          o.id,
          o.user_uid,
          o.username,
          o.amount_pi,
          o.phone_number,
          o.network_provider,
          o.data_plan,
          o.status,
          o.txid,
          o.created_at,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Network badge color
  const getNetworkColor = (network: string) => {
    switch (network.toLowerCase()) {
      case "mtn":
        return "bg-[#FFCC00]/20 text-[#FFCC00] border-[#FFCC00]/30";
      case "airtel":
        return "bg-[#E60000]/20 text-[#FF4444] border-[#E60000]/30";
      case "glo":
        return "bg-[#00A859]/20 text-[#00A859] border-[#00A859]/30";
      case "9mobile":
        return "bg-[#006400]/20 text-[#00CC00] border-[#006400]/30";
      default:
        return "bg-secondary text-foreground border-border";
    }
  };

  // Status badge
  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-success/20 text-success border border-success/30 hover:bg-success/20">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30 hover:bg-[#F59E0B]/20">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-destructive/20 text-destructive border border-destructive/30 hover:bg-destructive/20">
            <XCircle className="mr-1 h-3 w-3" />
            Failed
          </Badge>
        );
    }
  };

  // Pi Testnet BlockExplorer URL
  const getExplorerUrl = (txid: string) =>
    `https://blockexplorer.minepi.com/testnet/tx/${txid}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 px-4 py-4 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary transition-colors hover:bg-secondary/80"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-foreground">
                Admin Dashboard
              </h1>
              <p className="text-xs text-muted-foreground">
                Manage incoming orders
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsLoading(true);
                setTimeout(() => setIsLoading(false), 1000);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary transition-colors hover:bg-secondary/80"
            >
              <RefreshCw
                className={cn(
                  "h-5 w-5 text-foreground",
                  isLoading && "animate-spin"
                )}
              />
            </button>
            <button
              onClick={exportOrders}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary transition-colors hover:bg-primary/90"
            >
              <Download className="h-5 w-5 text-primary-foreground" />
            </button>
          </div>
        </div>
      </header>

      <main className="p-4">
        {/* Stats Grid */}
        <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatsCard
            title="Total Orders"
            value={totalOrders.toString()}
            icon={Users}
            trend="+12%"
            trendUp={true}
          />
          <StatsCard
            title="Total Pi Received"
            value={`${totalPi.toFixed(2)} Pi`}
            icon={Wallet}
            trend="+8%"
            trendUp={true}
          />
          <StatsCard
            title="Pending Orders"
            value={pendingOrders.toString()}
            subtitle="Needs attention"
            icon={Clock}
          />
          <StatsCard
            title="Completed"
            value={completedOrders.toString()}
            subtitle={`${((completedOrders / totalOrders) * 100).toFixed(0)}% success rate`}
            icon={CheckCircle2}
          />
        </section>

        {/* Search & Filters */}
        <section className="mb-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative flex-1 lg:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by phone, UID, username, or TXID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-xl bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors",
                  showFilters
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground hover:bg-secondary"
                )}
              >
                <Filter className="h-4 w-4" />
                Filters
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    showFilters && "rotate-180"
                  )}
                />
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          {showFilters && (
            <div className="mt-3 flex flex-wrap gap-2">
              {(["all", "pending", "completed", "failed"] as const).map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={cn(
                      "rounded-full px-4 py-1.5 text-xs font-medium capitalize transition-colors",
                      filterStatus === status
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-foreground hover:bg-secondary"
                    )}
                  >
                    {status}
                    {status !== "all" && (
                      <span className="ml-1.5 opacity-70">
                        (
                        {
                          orders.filter((o) =>
                            status === "all" ? true : o.status === status
                          ).length
                        }
                        )
                      </span>
                    )}
                  </button>
                )
              )}
            </div>
          )}
        </section>

        {/* Pending Alert */}
        {pendingOrders > 0 && (
          <section className="mb-4">
            <div className="flex items-center gap-3 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 p-4">
              <AlertTriangle className="h-5 w-5 shrink-0 text-[#F59E0B]" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {pendingOrders} Pending Order{pendingOrders > 1 ? "s" : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  Mark as completed after manually delivering data or integrating
                  with VTU API.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Orders Table */}
        <section className="rounded-2xl bg-card overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center p-20">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 text-center">
              <Search className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No orders found</p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border hover:bg-transparent">
                    <TableHead className="text-xs text-muted-foreground">
                      User
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground">
                      Amount
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground">
                      Phone
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground">
                      Network
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground">
                      Plan
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground">
                      Date
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="border-b border-border/50 hover:bg-secondary/30"
                    >
                      {/* User */}
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">
                            @{order.username}
                          </span>
                          <button
                            onClick={() =>
                              copyToClipboard(order.user_uid, `uid_${order.id}`)
                            }
                            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
                          >
                            <span className="font-mono">
                              {formatUid(order.user_uid)}
                            </span>
                            <Copy className="h-2.5 w-2.5" />
                            {copied === `uid_${order.id}` && (
                              <span className="text-success">Copied!</span>
                            )}
                          </button>
                        </div>
                      </TableCell>

                      {/* Amount */}
                      <TableCell>
                        <span className="text-sm font-semibold text-primary">
                          {order.amount_pi.toFixed(2)} Pi
                        </span>
                      </TableCell>

                      {/* Phone */}
                      <TableCell>
                        <span className="font-mono text-sm text-foreground">
                          {order.phone_number}
                        </span>
                      </TableCell>

                      {/* Network */}
                      <TableCell>
                        <Badge
                          className={cn(
                            "text-xs font-medium",
                            getNetworkColor(order.network_provider)
                          )}
                        >
                          {order.network_provider}
                        </Badge>
                      </TableCell>

                      {/* Plan */}
                      <TableCell>
                        <span className="text-sm text-foreground">
                          {order.data_plan}
                        </span>
                      </TableCell>

                      {/* Status with Toggle */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(order.status)}
                          {order.status !== "failed" && (
                            <Switch
                              checked={order.status === "completed"}
                              onCheckedChange={() => toggleOrderStatus(order.id)}
                              className="data-[state=checked]:bg-success"
                            />
                          )}
                        </div>
                      </TableCell>

                      {/* Date */}
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(order.created_at)}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() =>
                              copyToClipboard(order.txid, `txid_${order.id}`)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/50 transition-colors hover:bg-secondary"
                            title="Copy TXID"
                          >
                            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                          <a
                            href={getExplorerUrl(order.txid)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/50 transition-colors hover:bg-secondary"
                            title="View on Pi BlockExplorer"
                          >
                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                          </a>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>

        {/* Mobile Order Cards (Alternative view for small screens) */}
        <section className="mt-4 space-y-3 lg:hidden">
          {filteredOrders.map((order) => (
            <div
              key={`mobile_${order.id}`}
              className="rounded-xl bg-card p-4 border border-border/50"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    @{order.username}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(order.created_at)}
                  </p>
                </div>
                {getStatusBadge(order.status)}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="font-semibold text-primary">
                    {order.amount_pi.toFixed(2)} Pi
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-mono text-foreground">
                    {order.phone_number}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Network</p>
                  <Badge
                    className={cn(
                      "text-xs font-medium mt-1",
                      getNetworkColor(order.network_provider)
                    )}
                  >
                    {order.network_provider}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Plan</p>
                  <p className="text-foreground">{order.data_plan}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3">
                {order.status !== "failed" && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Mark as{" "}
                      {order.status === "pending" ? "completed" : "pending"}
                    </span>
                    <Switch
                      checked={order.status === "completed"}
                      onCheckedChange={() => toggleOrderStatus(order.id)}
                      className="data-[state=checked]:bg-success"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      copyToClipboard(order.txid, `txid_mobile_${order.id}`)
                    }
                    className="flex h-8 items-center gap-1 rounded-lg bg-secondary px-3 text-xs text-foreground"
                  >
                    <Copy className="h-3 w-3" />
                    TXID
                  </button>
                  <a
                    href={getExplorerUrl(order.txid)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-8 items-center gap-1 rounded-lg bg-primary px-3 text-xs text-primary-foreground"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Explorer
                  </a>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Pivtu Admin Panel
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground/70">
            Powered by{" "}
            <span className="font-semibold text-primary">Pi Network</span>
          </p>
        </footer>
      </main>
    </div>
  );
}
