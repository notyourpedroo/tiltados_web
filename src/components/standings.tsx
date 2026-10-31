import Link from "next/link";
import type { SeasonData } from "@/lib/season";
import { teamStyle } from "@/lib/teams";
import { Position, Table, TeamBar, TeamLogo, td, th, tr } from "./ui";

export function DriverStandingsTable({
  data,
  limit,
  compact = false,
}: {
  data: SeasonData;
  limit?: number;
  compact?: boolean;
}) {
  const rows = data.driverStandings.slice(0, limit);
  const leader = data.driverStandings[0]?.points ?? 0;
  return (
    <Table wide={!compact}>
      <thead>
        <tr>
          <th className={`${th} w-12`}>Pos</th>
          <th className={th}>Piloto</th>
          {!compact && <th className={`${th} hidden sm:table-cell`}>Equipe</th>}
          {!compact && <th className={`${th} text-right`}>Vitórias</th>}
          {!compact && <th className={`${th} text-right`}>Sprints</th>}
          <th className={`${th} text-right`}>Pódios</th>
          {!compact && <th className={`${th} text-right`}>Dif.</th>}
          <th className={`${th} text-right`}>Pts</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((d) => {
          const team = teamStyle(d.team_name);
          return (
            <tr key={d.driver_id} className={tr}>
              <td className={`${td} text-base`}>
                <Position value={d.position} />
              </td>
              <td className={td}>
                <Link
                  href={`/${data.season}/pilotos/${d.driver_id}`}
                  className="flex items-center gap-3 hover:underline"
                >
                  <TeamBar color={team.color} />
                  <span>
                    <span className="block text-base font-bold leading-tight">
                      {d.driver_name}
                    </span>
                    <span
                      className={`flex items-center gap-1 text-xs text-muted ${compact ? "" : "sm:hidden"}`}
                    >
                      {team.logo && <TeamLogo logo={team.logo} size={14} />}
                      {team.short}
                    </span>
                  </span>
                </Link>
              </td>
              {!compact && (
                <td className={`${td} hidden text-text-2 sm:table-cell`}>
                  <span className="flex items-center gap-2">
                    {team.logo && <TeamLogo logo={team.logo} />}
                    {d.team_name}
                  </span>
                </td>
              )}
              {!compact && <td className={`${td} tabular text-right`}>{d.wins}</td>}
              {!compact && <td className={`${td} tabular text-right`}>{d.sprint_wins}</td>}
              <td className={`${td} tabular text-right`}>{d.podiums}</td>
              {!compact && (
                <td className={`${td} tabular text-right text-muted`}>
                  {d.points === leader ? "—" : `−${leader - d.points}`}
                </td>
              )}
              <td className={`${td} tabular text-right text-base font-black`}>{d.points}</td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}

export function TeamStandingsTable({
  data,
  compact = false,
}: {
  data: SeasonData;
  compact?: boolean;
}) {
  const leader = data.teamStandings[0]?.points ?? 0;
  return (
    <Table wide={!compact}>
      <thead>
        <tr>
          <th className={`${th} w-12`}>Pos</th>
          <th className={th}>Equipe</th>
          {!compact && <th className={`${th} text-right`}>Vitórias</th>}
          <th className={`${th} text-right`}>Pódios</th>
          {!compact && <th className={`${th} text-right`}>Dif.</th>}
          <th className={`${th} text-right`}>Pts</th>
        </tr>
      </thead>
      <tbody>
        {data.teamStandings.map((t) => {
          const style = teamStyle(t.team_name);
          return (
            <tr key={t.team_id} className={tr}>
              <td className={`${td} text-base`}>
                <Position value={t.position} />
              </td>
              <td className={td}>
                <Link
                  href={`/${data.season}/equipes/${t.team_id}`}
                  className="flex items-center gap-3 hover:underline"
                >
                  <TeamBar color={style.color} />
                  {style.logo && <TeamLogo logo={style.logo} size={24} />}
                  <span className="text-base font-bold leading-tight">
                    {compact ? style.short : t.team_name}
                  </span>
                </Link>
              </td>
              {!compact && <td className={`${td} tabular text-right`}>{t.wins}</td>}
              <td className={`${td} tabular text-right`}>{t.podiums}</td>
              {!compact && (
                <td className={`${td} tabular text-right text-muted`}>
                  {t.points === leader ? "—" : `−${leader - t.points}`}
                </td>
              )}
              <td className={`${td} tabular text-right text-base font-black`}>{t.points}</td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}
