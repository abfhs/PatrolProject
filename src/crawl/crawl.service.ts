import { Injectable } from '@nestjs/common';

@Injectable()
export class CrawlService {
    async churiProcess(address: string, name: string){
        return {address, name}
    }
}
