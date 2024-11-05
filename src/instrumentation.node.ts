'use strict'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

// Add otel logging
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR); // set diaglog level to DEBUG when debugging

const exporterOptions = {
    url: 'https://localhost:3000/trace',
}

export const traceExporter = new OTLPTraceExporter(exporterOptions);