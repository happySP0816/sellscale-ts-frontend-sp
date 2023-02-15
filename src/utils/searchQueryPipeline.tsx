import { SpotlightAction } from "@mantine/spotlight";
import { NavigateFunction } from "react-router-dom";

/**
 * 
 * @param query 
 * @param navigate 
 * @returns - SplotlightActions, or null (= loading) or false (= failed to find).
 */
export async function activateQueryPipeline(query: string, navigate: NavigateFunction): Promise<SpotlightAction[] | null | false> {

  return [];

}
