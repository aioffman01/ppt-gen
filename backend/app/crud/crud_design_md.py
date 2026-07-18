from app.crud.base import CRUDBase
from app.models.design_md import DesignMD
from app.schemas.design_md import DesignMDCreate, DesignMDUpdate

class CRUDDesignMD(CRUDBase[DesignMD, DesignMDCreate, DesignMDUpdate]):
    pass

crud_design_md = CRUDDesignMD(DesignMD)
