import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('utils')
@Controller('utils')
export class UtilsController {
  @Get('now')
  @ApiOperation({ summary: 'Obtener fecha y hora actual del servidor' })
  getNow() {
    const now = new Date();
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const two = (n: number) => n.toString().padStart(2, '0');
    return {
      nowIso: now.toISOString(),
      date: `${now.getFullYear()}-${two(now.getMonth() + 1)}-${two(now.getDate())}`,
      time: `${two(now.getHours())}:${two(now.getMinutes())}`,
      timezone: tz,
    };
  }

  @Get('resolve-date')
  @ApiOperation({ summary: 'Normaliza una fecha textual a YYYY-MM-DD y retorna día de la semana' })
  resolveDate(query: { text?: string; tz?: string; lang?: string }) {
    const { text = '', tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', lang = 'es' } = query || {} as any;

    const now = new Date();
    const currentYear = now.getFullYear();

    const two = (n: number) => n.toString().padStart(2, '0');
    const esMonths: Record<string, number> = {
      enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
      julio: 7, agosto: 8, septiembre: 9, setiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
    };
    const enMonths: Record<string, number> = {
      january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
      july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
      jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
    };

    function weekdayName(d: Date, l: string) {
      return new Intl.DateTimeFormat(l.startsWith('es') ? 'es-AR' : 'en-US', { weekday: 'long' }).format(d);
    }

    function fromYMD(y: number, m: number, d: number) {
      const date = new Date(Date.UTC(y, m - 1, d));
      return {
        date: `${y}-${two(m)}-${two(d)}`,
        weekday: weekdayName(date, lang),
        timezone: tz,
      };
    }

    const t = text.trim().toLowerCase();

    // Relative Spanish keywords
    if (lang.toLowerCase().startsWith('es')) {
      if (/^hoy$/.test(t)) {
        return fromYMD(currentYear, now.getMonth() + 1, now.getDate());
      }
      if (/^mañana$/.test(t)) {
        const d = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        return fromYMD(d.getFullYear(), d.getMonth() + 1, d.getDate());
      }
      if (/^pasado\s*mañana$/.test(t)) {
        const d = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
        return fromYMD(d.getFullYear(), d.getMonth() + 1, d.getDate());
      }
    } else {
      // Relative English keywords
      if (/^today$/.test(t)) {
        return fromYMD(currentYear, now.getMonth() + 1, now.getDate());
      }
      if (/^tomorrow$/.test(t)) {
        const d = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        return fromYMD(d.getFullYear(), d.getMonth() + 1, d.getDate());
      }
      if (/^(day\s*after\s*tomorrow|in\s*2\s*days)$/.test(t)) {
        const d = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
        return fromYMD(d.getFullYear(), d.getMonth() + 1, d.getDate());
      }
    }

    // Próximo <weekday> / Next <weekday>
    const esWeekdays = ['domingo','lunes','martes','miércoles','miercoles','jueves','viernes','sábado','sabado'];
    const enWeekdays = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];

    function nextWeekdayIndex(current: number, target: number, inclusive = false) {
      const diff = (target - current + 7) % 7;
      return inclusive ? diff : (diff === 0 ? 7 : diff);
    }

    if (lang.toLowerCase().startsWith('es')) {
      const m = t.match(/(proximo|próximo|este|el)\s+([a-záéíóúñ]+)/);
      if (m) {
        const wdName = m[2].normalize('NFD').replace(/[^a-z]/g, '');
        const idx = esWeekdays.findIndex(w => w === wdName);
        const currentIdx = now.getDay();
        if (idx >= 0) {
          const normalizedIdx = idx > 6 ? 6 : idx; // handle variantes sabado/miercoles
          const daysToAdd = nextWeekdayIndex(currentIdx, normalizedIdx, m[1] === 'este' || m[1] === 'el');
          const d = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
          return fromYMD(d.getFullYear(), d.getMonth() + 1, d.getDate());
        }
      }
    } else {
      const m = t.match(/(next|this)\s+([a-z]+)/);
      if (m) {
        const wdName = m[2];
        const idx = enWeekdays.indexOf(wdName);
        const currentIdx = now.getDay();
        if (idx >= 0) {
          const daysToAdd = nextWeekdayIndex(currentIdx, idx, m[1] === 'this');
          const d = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
          return fromYMD(d.getFullYear(), d.getMonth() + 1, d.getDate());
        }
      }
    }

    // 1) ISO YYYY-MM-DD
    const iso = t.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (iso) {
      const y = parseInt(iso[1], 10);
      const m = parseInt(iso[2], 10);
      const d = parseInt(iso[3], 10);
      return fromYMD(y, m, d);
    }

    // 2) dd/mm[/yyyy] (es) o mm/dd[/yyyy] (en)
    const slash = t.match(/^(\d{1,2})[\/-](\d{1,2})(?:[\/-](\d{2,4}))?$/);
    if (slash) {
      let a = parseInt(slash[1], 10);
      let b = parseInt(slash[2], 10);
      let y = slash[3] ? parseInt(slash[3], 10) : currentYear;
      if (y < 100) y += 2000;
      const isEs = lang.toLowerCase().startsWith('es');
      const d = isEs ? a : b;
      const m = isEs ? b : a;
      return fromYMD(y, m, d);
    }

    // 3) "3 de noviembre [2025]" (es)
    const es = t.match(/(\d{1,2})\s*(de)?\s*([a-záéíóúñ]+)(?:\s*(de)?\s*(\d{4}))?/);
    if (es && lang.toLowerCase().startsWith('es')) {
      const d = parseInt(es[1], 10);
      const monthName = es[3].normalize('NFD').replace(/[^a-z]/g, '');
      const m = esMonths[monthName];
      const y = es[5] ? parseInt(es[5], 10) : currentYear;
      if (m) return fromYMD(y, m, d);
    }

    // 4) "november 3 [2025]" (en)
    const en = t.match(/([a-z]+)\s*(\d{1,2})(?:,?\s*(\d{4}))?/);
    if (en && !lang.toLowerCase().startsWith('es')) {
      const monthName = en[1];
      const d = parseInt(en[2], 10);
      const y = en[3] ? parseInt(en[3], 10) : currentYear;
      const m = enMonths[monthName];
      if (m) return fromYMD(y, m, d);
    }

    // Fallback: hoy
    return fromYMD(currentYear, now.getMonth() + 1, now.getDate());
  }
}


