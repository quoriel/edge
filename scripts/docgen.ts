import { generateMetadata } from "@tryforge/forgescript";
import { resolve } from "path";

generateMetadata(resolve(process.cwd(), 'dist/functions'), "functions")