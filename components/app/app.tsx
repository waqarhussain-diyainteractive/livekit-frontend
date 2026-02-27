'use client';

import { useMemo, useState } from 'react';
import { TokenSource } from 'livekit-client';
import {
  RoomAudioRenderer,
  SessionProvider,
  StartAudio,
  useSession,
} from '@livekit/components-react';
import type { AppConfig } from '@/app-config';
import { ViewController } from '@/components/app/view-controller';
import { Toaster } from '@/components/livekit/toaster';
import { useAgentErrors } from '@/hooks/useAgentErrors';
import { useDebugMode } from '@/hooks/useDebug';
import { getSandboxTokenSource } from '@/lib/utils';

const IN_DEVELOPMENT = process.env.NODE_ENV !== 'production';

function AppSetup() {
  useDebugMode({ enabled: IN_DEVELOPMENT });
  useAgentErrors();

  return null;
}

interface AppProps {
  appConfig: AppConfig;
}

export function App({ appConfig }: AppProps) {
  const [clientName, setClientName] = useState<string | null>(null);

  const tokenSource = useMemo(() => {
    if (typeof process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT === 'string') {
      return getSandboxTokenSource(appConfig);
    }

    // Create a custom token fetcher that includes clientName in the request
    return TokenSource.custom(async () => {
      console.log('Fetching connection details with clientName:', clientName);

      const response = await fetch('/api/connection-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_config: appConfig.agentName
            ? { agents: [{ agent_name: appConfig.agentName }] }
            : undefined,
          clientName: clientName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get connection details');
      }

      const data = await response.json();
      console.log('Received connection details:', data);
      return data;
    });
  }, [appConfig, clientName]);

  const session = useSession(tokenSource);

  return (
    <SessionProvider session={session}>
      <AppSetup />
      <main className="grid h-svh grid-cols-1 place-content-center">
        <ViewController
          appConfig={appConfig}
          clientName={clientName}
          onAuthenticated={setClientName}
        />
      </main>
      <StartAudio label="Start Audio" />
      <RoomAudioRenderer />
      <Toaster />
    </SessionProvider>
  );
}
