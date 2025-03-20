# app/models/__init__.py
import os
import importlib
import logging
from app.db.database import Base

__all__ = ['Base']

logger = logging.getLogger(__name__)

_model_modules = []
_current_dir = os.path.dirname(os.path.abspath(__file__))

_py_files = [
    f[:-3] for f in os.listdir(_current_dir) 
    if f.endswith('.py') and f != '__init__.py' and not f.startswith('_')
]

for _module_name in _py_files:
    try:
        _module = importlib.import_module(f"app.models.{_module_name}")
        _model_modules.append(_module)
        for _attr_name in dir(_module):
            _attr = getattr(_module, _attr_name)
            if (isinstance(_attr, type) and 
                hasattr(_attr, "__tablename__") and 
                _attr != Base and
                hasattr(_attr, "__table__")):
                globals()[_attr_name] = _attr
                __all__.append(_attr_name)
    except ImportError as e:
        logger.warning(f"Failed to import model module {_module_name}: {e}")
    except Exception as e:
        logger.error(f"Error processing model module {_module_name}: {e}")

logger.debug(f"Imported models: {', '.join(__all__)}")