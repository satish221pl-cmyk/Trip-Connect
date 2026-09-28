import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Home from "@/pages/Home";
import Workspace from "@/pages/Workspace";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

function Router() {
  return <Switch>
    <Route path="/" component={Home} />
    <Route path="/home" component={Workspace} />
    <Route path="/explore" component={Workspace} />
    <Route path="/travelers" component={Workspace} />
    <Route path="/guides" component={Workspace} />
    <Route path="/plan-trip" component={Workspace} />
    <Route path="/ai-guide" component={Workspace} />
    <Route path="/trips" component={Workspace} />
    <Route path="/messages" component={Workspace} />
    <Route path="/friends" component={Workspace} />
    <Route path="/profile" component={Workspace} />
    <Route path="/journal" component={Workspace} />
    <Route path="/expenses" component={Workspace} />
    <Route path="/safety" component={Workspace} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
