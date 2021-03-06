import { NextApiRequest, NextApiResponse } from 'next'
import { parseCookies, setCookie } from 'nookies'
import { v4 as uuidV4 } from 'uuid'
import { database } from '../../services/firebase';
import { set, ref, remove } from 'firebase/database';

export default function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method === 'POST') {
    const { track } = req.body;
    const { ['web-app_deezer.uuid']: userUuid } = parseCookies({ req })

    if (userUuid) {
      return set(ref(database, `users/${userUuid}/tracks/${track.id}`), track)
      .then(() => {
        return res.status(201).json({ success: true });
      })
      .catch(err =>
        res
          .status(501)
          .json({ error: `Sorry something Happened! ${err.message}` })
      );
    }

    if (!userUuid) {
      const userUuid = uuidV4()
      setCookie({ res }, 'web-app_deezer.uuid', userUuid, {
        path: '/',
        sameSite: "strict"
      })
    
      return set(ref(database, `users/${userUuid}/tracks/${track.id}`), track)
      .then(() => {
        return res.status(201).json({ success: true });
      })
      .catch(err =>
        res
          .status(501)
          .json({ error: `Sorry something Happened! ${err.message}` })
      );
    }
  }

  if(req.method === 'DELETE') {
    const { trackId } = req.body;
    const { ['web-app_deezer.uuid']: userUuid } = parseCookies({ req })

    return remove(ref(database, `users/${userUuid}/tracks/${trackId}`))
    .then(() => {
      return res.status(201).json({ success: true });
    })
    .catch(err =>
      res
        .status(501)
        .json({ error: `Sorry something Happened! ${err.message}` })
    );
  }
}