import { Controller, Get, HttpException, HttpStatus } from "@nestjs/common";
import { dateFormat } from "./common/constants/variables.constants";
import { ApiTags } from "@nestjs/swagger";
import moment from 'moment-timezone';

@ApiTags('App')
@Controller("app")
export class AppController {

    private readonly started: Date;

    constructor() {
        this.started = new Date();
    }

    @Get("version")
    async version() {
        return process.env.MOVIL_VERSION
    }

    @Get("date")
    async date() {
        return moment().format(dateFormat)
    }

    @Get("singOfLike")
    checkHealth(): string {
        const durationInSeconds = (new Date().getTime() - this.started.getTime()) / 1000;

        console.log(durationInSeconds);

        if (!durationInSeconds) {
            throw new HttpException(
                `error: ${durationInSeconds}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        return 'ok';
    }
}