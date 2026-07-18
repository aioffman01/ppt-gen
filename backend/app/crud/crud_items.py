from app.crud.base import CRUDBase
from app.models.models import Font, Reference
from app.schemas.schemas import FontCreate, FontUpdate, ReferenceCreate, ReferenceUpdate

class CRUDInstanceFont(CRUDBase[Font, FontCreate, FontUpdate]):
    pass

class CRUDInstanceReference(CRUDBase[Reference, ReferenceCreate, ReferenceUpdate]):
    pass

crud_font = CRUDInstanceFont(Font)
crud_reference = CRUDInstanceReference(Reference)
