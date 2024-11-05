"use strict";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { diag, DiagConsoleLogger, DiagLogLevel, trace } from "@opentelemetry/api";
import { BasicTracerProvider, BatchSpanProcessor, Span } from "@opentelemetry/sdk-trace-base";

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR); // set diaglog level to DEBUG when debugging

const exporterOptions = {
  url: "http://localhost:3000/trace",
};

export const traceExporter = new OTLPTraceExporter(exporterOptions);

const filterNextJsSpans = (span: Span): boolean => {
  if (span.attributes["next.span_type"]) {
    return false;
  }
  return true;
};

// Custom BatchSpanProcessor to filter out specific spans
class FilteringBatchSpanProcessor extends BatchSpanProcessor {
  constructor(
    exporter: OTLPTraceExporter,
    private filter: (span: Span) => boolean
  ) {
    super(exporter);
  }

  onEnd(span: Span): void {
    if (this.filter(span)) {
      super.onEnd(span);
    } else {
      //console.log(`!!!!!Filtered span: ${span.name}: ${JSON.stringify(span.attributes)}`);
    }
  }
}

// Initialize the Tracer Provider
const provider = new BasicTracerProvider();

provider.addSpanProcessor(new FilteringBatchSpanProcessor(traceExporter, filterNextJsSpans));

provider.register();

// registerInstrumentations({
//     instrumentations: [new OpenAIInstrumentation()],
// });

export const tracer = trace.getTracer("Invoice Parser");
