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
  ChevronDown,
  Lock,
  ShieldAlert,
  Eye,
  EyeOff,
  DollarSign,
  Save,
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

// Admin Login Component (Password Only)
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

export default function AdminDashboard() {
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
  
  // VTU Balance Management
  const [vtuNairaBalance, setVtuNairaBalance] = useState("10000.00");
  const [vtuBalanceInput, setVtuBalanceInput] = useState("10000.00");
  const [isBalanceSaved, setIsBalanceSaved] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const adminSession = sessionStorage.getItem("pivtu_admin_session");
    if (adminSession) {
      setIsAdminAuthenticated(true);
    }
  }, []);

  // Handle admin login (password only)
  const handleAdminLogin = async (password: string) => {
    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsAdminAuthenticated(true);
        // Store session
        sessionStorage.setItem("pivtu_admin_session", "true");
        // Load orders after successful auth
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 1000);
      } else {
        setAuthError(data.error || "Invalid password");
      }
    } catch (error) {
      console.error("[Admin] Login error:", error);
      setAuthError("Failed to authenticate. Please try again.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Show login screen if not authenticated
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

  // Save VTU Balance
  const saveVtuBalance = () => {
    const parsed = parseFloat(vtuBalanceInput);
    if (!isNaN(parsed) && parsed >= 0) {
      setVtuNairaBalance(parsed.toFixed(2));
      setIsBalanceSaved(true);
      // In production, save to backend
      console.log("[Admin] VTU Balance updated to:", parsed.toFixed(2));
    }
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
                Manage orders & VTU balance
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
        {/* VTU Balance Management */}
        <section className="mb-6">
          <div className="rounded-xl bg-gradient-to-br from-success/20 to-success/5 border border-success/30 p-5">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="h-5 w-5 text-success" />
              <h2 className="text-base font-semibold text-foreground">
                VTU API Balance
              </h2>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">
                  Naira Liquidity (NGN)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-success">NGN</span>
                  <input
                    type="number"
                    value={vtuBalanceInput}
                    onChange={(e) => {
                      setVtuBalanceInput(e.target.value);
                      setIsBalanceSaved(false);
                    }}
                    className="h-12 flex-1 rounded-xl bg-background/50 px-4 text-xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-success"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <button
                onClick={saveVtuBalance}
                disabled={isBalanceSaved}
                className={cn(
                  "flex h-12 items-center gap-2 rounded-xl px-4 font-medium transition-colors",
                  isBalanceSaved
                    ? "bg-success/20 text-success cursor-default"
                    : "bg-success text-success-foreground hover:bg-success/90"
                )}
              >
                {isBalanceSaved ? (
                  <>
                    <CheckCircle2 className="h-5 w-5" />
                    Saved
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Save
                  </>
                )}
              </button>
            </div>
            
            <p className="mt-3 text-xs text-muted-foreground">
              Enter your VTU provider API balance to monitor liquidity. This is for tracking purposes only.
            </p>
          </div>
        </section>

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

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-3 flex flex-wrap gap-2">
              {(["all", "pending", "completed", "failed"] as const).map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                      filterStatus === status
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-foreground hover:bg-secondary"
                    )}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                )
              )}
            </div>
          )}
        </section>

        {/* Orders Table */}
        <section className="rounded-xl bg-card overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center p-20">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 text-center">
              <Search className="mb-4 h-12 w-12 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Network</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">
                            {order.data_plan}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.phone_number}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">
                            @{order.username}
                          </p>
                          <p className="font-mono text-xs text-muted-foreground">
                            {formatUid(order.user_uid)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-primary">
                          {order.amount_pi.toFixed(2)} Pi
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "border",
                            getNetworkColor(order.network_provider)
                          )}
                        >
                          {order.network_provider}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(order.created_at)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={order.status === "completed"}
                            onCheckedChange={() => toggleOrderStatus(order.id)}
                            disabled={order.status === "failed"}
                          />
                          <button
                            onClick={() =>
                              copyToClipboard(order.txid, order.id)
                            }
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                            title="Copy TXID"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <a
                            href={getExplorerUrl(order.txid)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                            title="View on Explorer"
                          >
                            <ExternalLink className="h-4 w-4" />
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

        {/* Footer */}
        <footer className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Pivtu Admin Panel - Powered by Pi Network
          </p>
        </footer>
      </main>
    </div>
  );
}
